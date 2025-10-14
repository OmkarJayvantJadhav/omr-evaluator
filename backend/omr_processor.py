import cv2
import numpy as np
from PIL import Image
import json
import time
from typing import Dict, List, Tuple, Optional
import os
from pdf2image import convert_from_path

class OMRProcessor:
    def __init__(self):
        self.confidence_threshold = 0.45  # Optimized for filled bubbles
        self.bubble_min_area = 30  # Smaller for tight layouts
        self.bubble_max_area = 3000  # Wider range for varied resolutions
        self.aspect_ratio_threshold = 0.5  # Balanced for circular bubbles
        self.column_gap_threshold = 40  # Adjusted for tight column spacing
        
    def process_omr_sheet(self, file_path: str, total_questions: int, number_of_choices: int = 4) -> Dict:
        """
        Main function to process OMR sheet and extract answers.
        
        Args:
            file_path: Path to the OMR sheet image/PDF
            total_questions: Number of questions in the exam
            number_of_choices: Number of choices per question (4 for A-D, 5 for A-E, etc.)
            
        Returns:
            Dictionary containing extracted answers and processing info
        """
        start_time = time.time()
        
        try:
            # Validate file exists
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
                
            # Validate file format
            if not validate_omr_format(file_path):
                raise ValueError(f"Unsupported file format. Please use JPG, JPEG, PNG, or PDF")
            
            # Handle PDF files
            if file_path.lower().endswith('.pdf'):
                image = self._convert_pdf_to_image(file_path)
            else:
                image = cv2.imread(file_path)
            
            if image is None:
                raise ValueError("Could not load image file. The file may be corrupted or in an unsupported format.")
            
            # Process the image
            processed_image = self._preprocess_image(image)
            contours = self._detect_bubbles(processed_image)
            
            if not contours:
                raise ValueError("No bubbles detected in the image. Please check the image quality and format.")
                
            bubbles = self._filter_bubbles(contours, processed_image)
            
            if not bubbles:
                raise ValueError("No valid bubbles found after filtering. Please check the image quality.")
                
            answers = self._extract_answers(bubbles, total_questions, number_of_choices)
            
            processing_time = time.time() - start_time
            confidence = self._calculate_confidence(bubbles, answers, total_questions, number_of_choices)
            
            return {
                "success": True,
                "answers": answers,
                "confidence": confidence,
                "processing_time": processing_time,
                "total_bubbles_detected": len(bubbles),
                "message": "OMR sheet processed successfully"
            }
            
        except FileNotFoundError as e:
            return {
                "success": False,
                "answers": {},
                "confidence": 0.0,
                "processing_time": time.time() - start_time,
                "total_bubbles_detected": 0,
                "message": f"File not found: {str(e)}"
            }
        except ValueError as e:
            return {
                "success": False,
                "answers": {},
                "confidence": 0.0,
                "processing_time": time.time() - start_time,
                "total_bubbles_detected": 0,
                "message": f"Invalid input: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "answers": {},
                "confidence": 0.0,
                "processing_time": time.time() - start_time,
                "total_bubbles_detected": 0,
                "message": f"Error processing OMR sheet: {str(e)}"
            }
    
    def _convert_pdf_to_image(self, pdf_path: str) -> np.ndarray:
        """Convert PDF to image for processing."""
        try:
            images = convert_from_path(pdf_path, dpi=300)
            if not images:
                raise ValueError("Could not convert PDF to image - no pages found")
            
            # Use the first page
            pil_image = images[0]
            return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        except Exception as e:
            raise ValueError(f"PDF conversion error: {str(e)}")
    
    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess the image for better bubble detection.
        Enhanced for large sheets with 200+ questions.
        """
        # Resize if image is too large (for performance), but keep good resolution
        height, width = image.shape[:2]
        max_dimension = 3500  # Increased for better detail preservation
        
        if max(height, width) > max_dimension:
            scale = max_dimension / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply bilateral filter to preserve edges while reducing noise
        denoised = cv2.bilateralFilter(gray, 9, 75, 75)
        
        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(denoised, (3, 3), 0)
        
        # Apply adaptive threshold with optimized parameters
        block_size = 15 if max(height, width) > 2000 else 11
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, block_size, 3
        )
        
        # Apply morphological operations to clean up and separate touching bubbles
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel, iterations=1)
        
        return cleaned
    
    def _detect_bubbles(self, processed_image: np.ndarray) -> List:
        """Detect potential bubble contours in the image."""
        contours, _ = cv2.findContours(
            processed_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        return contours
    
    def _filter_bubbles(self, contours: List, image: np.ndarray) -> List[Dict]:
        """Filter contours to identify actual bubble marks."""
        bubbles = []
        
        for contour in contours:
            # Calculate contour properties
            area = cv2.contourArea(contour)
            if area < self.bubble_min_area or area > self.bubble_max_area:
                continue
            
            # Check if contour is roughly circular (more lenient)
            perimeter = cv2.arcLength(contour, True)
            if perimeter == 0:
                continue
            
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            if circularity < 0.2:  # More lenient for varied bubble shapes
                continue
            
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)
            if h == 0:  # Avoid division by zero
                continue
            aspect_ratio = float(w) / h
            if abs(aspect_ratio - 1.0) > 0.6:  # More lenient aspect ratio
                continue
            
            # Calculate fill ratio (how much of the bubble is filled)
            mask = np.zeros(image.shape, dtype=np.uint8)
            cv2.fillPoly(mask, [contour], 255)
            filled_pixels = cv2.countNonZero(cv2.bitwise_and(image, mask))
            total_pixels = int(area)
            fill_ratio = filled_pixels / total_pixels if total_pixels > 0 else 0
            
            bubbles.append({
                'contour': contour,
                'center': (x + w//2, y + h//2),
                'area': area,
                'fill_ratio': fill_ratio,
                'bounding_box': (x, y, w, h),
                'circularity': circularity
            })
        
        # Sort bubbles by position (top to bottom, left to right)
        bubbles.sort(key=lambda b: (b['center'][1], b['center'][0]))
        
        return bubbles
    
    def _extract_answers(self, bubbles: List[Dict], total_questions: int, number_of_choices: int = 4) -> Dict[str, str]:
        """
        Extract answers from detected bubbles with automatic column detection.
        Supports 200+ questions with multi-column layouts.
        """
        answers = {}
        
        if not bubbles:
            return answers
        
        # Generate choices based on number_of_choices
        choices = [chr(ord('A') + i) for i in range(number_of_choices)]
        
        # Detect columns automatically
        columns = self._detect_columns(bubbles)
        
        if not columns:
            # Fallback to single column processing
            rows = self._group_bubbles_by_rows(bubbles)
            return self._extract_from_rows(rows, total_questions, number_of_choices, choices)
        
        # Process each column and merge results
        question_num = 1
        
        for column in columns:
            if question_num > total_questions:
                break
                
            # Group bubbles in this column by rows
            column_rows = self._group_bubbles_by_rows(column)
            
            # Extract answers from this column
            for row in column_rows:
                if question_num > total_questions:
                    break
                    
                if not row:
                    continue
                
                # Sort bubbles in row by x-coordinate (left to right)
                row.sort(key=lambda b: b['center'][0])
                
                # Find the most filled bubble in this row
                max_fill_ratio = 0
                selected_choice = None
                
                for i, bubble in enumerate(row[:number_of_choices]):
                    if bubble['fill_ratio'] > max_fill_ratio and bubble['fill_ratio'] > self.confidence_threshold:
                        max_fill_ratio = bubble['fill_ratio']
                        selected_choice = choices[i] if i < len(choices) else None
                
                if selected_choice:
                    answers[str(question_num)] = selected_choice
                
                question_num += 1
        
        return answers
    
    def _detect_columns(self, bubbles: List[Dict]) -> List[List[Dict]]:
        """
        Automatically detect columns in the OMR sheet.
        Works for any number of columns (1 to N).
        Enhanced to better handle 150+ question sheets.
        """
        if not bubbles:
            return []
        
        # Extract x-coordinates of all bubble centers
        x_coords = [b['center'][0] for b in bubbles]
        
        if not x_coords:
            return []
        
        # Use clustering approach for better column detection
        x_sorted = sorted(set(x_coords))  # Remove duplicates
        
        if len(x_sorted) < 2:
            return [bubbles]
        
        # Calculate gaps between consecutive x-coordinates
        gaps = []
        for i in range(1, len(x_sorted)):
            gap = x_sorted[i] - x_sorted[i-1]
            gaps.append((x_sorted[i-1], x_sorted[i], gap))
        
        # Calculate statistics for gap detection
        gap_sizes = [g[2] for g in gaps]
        median_gap = np.median(gap_sizes)
        std_gap = np.std(gap_sizes)
        
        # A column separator is a gap significantly larger than typical gaps
        threshold = max(self.column_gap_threshold, median_gap + 2 * std_gap)
        
        # Find significant gaps (column separators)
        significant_gaps = [g for g in gaps if g[2] > threshold]
        
        # If no significant gaps, treat as single column
        if not significant_gaps:
            return [bubbles]
        
        # Sort significant gaps by position
        significant_gaps.sort(key=lambda g: g[0])
        
        # Calculate separator positions (middle of each gap)
        separator_positions = [g[0] + (g[1] - g[0]) / 2 for g in significant_gaps]
        
        # Create column boundaries
        min_x = min(x_coords)
        max_x = max(x_coords)
        boundaries = [min_x - 1] + separator_positions + [max_x + 1]
        
        # Group bubbles into columns
        columns = []
        for i in range(len(boundaries) - 1):
            left_bound = boundaries[i]
            right_bound = boundaries[i + 1]
            
            column_bubbles = [
                b for b in bubbles 
                if left_bound < b['center'][0] < right_bound
            ]
            
            if column_bubbles:
                # Sort column bubbles by y-coordinate (top to bottom)
                column_bubbles.sort(key=lambda b: b['center'][1])
                columns.append(column_bubbles)
        
        return columns
    
    def _extract_from_rows(self, rows: List[List[Dict]], total_questions: int, 
                          number_of_choices: int, choices: List[str]) -> Dict[str, str]:
        """
        Fallback method to extract answers from rows (single column).
        """
        answers = {}
        question_num = 1
        
        for row in rows[:total_questions]:
            if not row:
                continue
            
            row.sort(key=lambda b: b['center'][0])
            
            max_fill_ratio = 0
            selected_choice = None
            
            for i, bubble in enumerate(row[:number_of_choices]):
                if bubble['fill_ratio'] > max_fill_ratio and bubble['fill_ratio'] > self.confidence_threshold:
                    max_fill_ratio = bubble['fill_ratio']
                    selected_choice = choices[i] if i < len(choices) else None
            
            if selected_choice:
                answers[str(question_num)] = selected_choice
            
            question_num += 1
        
        return answers
    
    def _group_bubbles_by_rows(self, bubbles: List[Dict]) -> List[List[Dict]]:
        """
        Group bubbles into rows based on y-coordinate.
        Enhanced to handle varied row spacing in large sheets.
        """
        if not bubbles:
            return []
        
        if len(bubbles) == 1:
            return [[bubbles[0]]]
        
        # Calculate adaptive row threshold based on bubble density
        y_coords = sorted([b['center'][1] for b in bubbles])
        y_diffs = [y_coords[i+1] - y_coords[i] for i in range(len(y_coords)-1) if y_coords[i+1] - y_coords[i] > 0]
        
        if y_diffs:
            # Use percentile-based approach for better handling of tight spacing
            small_diffs = [d for d in y_diffs if d < 100]
            if small_diffs:
                # Use 75th percentile of small differences
                row_threshold = np.percentile(small_diffs, 75) * 1.3
            else:
                row_threshold = np.median(y_diffs) * 0.8 if y_diffs else 25
        else:
            row_threshold = 25
        
        # Ensure minimum threshold for very tight layouts
        row_threshold = max(row_threshold, 15)
        
        rows = []
        current_row = [bubbles[0]]
        
        for bubble in bubbles[1:]:
            # Use average y of current row for better grouping
            current_row_y = np.mean([b['center'][1] for b in current_row])
            bubble_y = bubble['center'][1]
            
            if abs(bubble_y - current_row_y) <= row_threshold:
                current_row.append(bubble)
            else:
                if current_row:
                    rows.append(current_row)
                current_row = [bubble]
        
        if current_row:
            rows.append(current_row)
        
        return rows
    
    def _calculate_confidence(self, bubbles: List[Dict], answers: Dict[str, str], total_questions: int, number_of_choices: int) -> float:
        """Calculate overall confidence score for the processing."""
        if not bubbles:
            return 0.0
        
        # Base confidence on number of questions answered vs total bubbles
        answered_questions = len(answers)
        total_bubbles = len(bubbles)
        
        if total_bubbles == 0:
            return 0.0
        
        # Calculate average fill ratio of answered bubbles
        fill_ratios = []
        for bubble in bubbles:
            if bubble['fill_ratio'] > self.confidence_threshold:
                fill_ratios.append(bubble['fill_ratio'])
        
        avg_fill_ratio = np.mean(fill_ratios) if fill_ratios else 0.0
        
        # Calculate confidence based on multiple factors
        expected_bubbles = total_questions * number_of_choices
        answer_ratio = min(1.0, answered_questions / total_questions) if total_questions > 0 else 0.0
        detection_ratio = min(1.0, total_bubbles / max(expected_bubbles, 1)) if expected_bubbles > 0 else 0.0
        confidence = min(1.0, (avg_fill_ratio * 0.4 + answer_ratio * 0.4 + detection_ratio * 0.2))
        
        return round(confidence, 2)
    
    def debug_omr_processing(self, file_path: str, total_questions: int, number_of_choices: int = 4) -> Dict:
        """Debug version with detailed processing information."""
        try:
            if file_path.lower().endswith('.pdf'):
                image = self._convert_pdf_to_image(file_path)
            else:
                image = cv2.imread(file_path)
            
            if image is None:
                return {"error": "Could not load image"}
            
            processed_image = self._preprocess_image(image)
            contours = self._detect_bubbles(processed_image)
            bubbles = self._filter_bubbles(contours, processed_image)
            
            debug_info = {
                "total_contours_found": len(contours),
                "bubbles_after_filtering": len(bubbles),
                "bubble_details": []
            }
            
            for i, bubble in enumerate(bubbles):
                debug_info["bubble_details"].append({
                    "index": i,
                    "center": bubble['center'],
                    "area": bubble['area'],
                    "fill_ratio": round(bubble['fill_ratio'], 3),
                    "circularity": round(bubble['circularity'], 3),
                    "bounding_box": bubble['bounding_box']
                })
            
            # Group into rows for analysis
            rows = self._group_bubbles_by_rows(bubbles)
            debug_info["rows_detected"] = len(rows)
            debug_info["row_analysis"] = []
            
            for i, row in enumerate(rows):
                row_info = {
                    "row_index": i,
                    "bubbles_in_row": len(row),
                    "bubbles": []
                }
                
                row.sort(key=lambda b: b['center'][0])  # Sort by x-coordinate
                for j, bubble in enumerate(row):
                    row_info["bubbles"].append({
                        "position": j,
                        "fill_ratio": round(bubble['fill_ratio'], 3),
                        "above_min_threshold": bubble['fill_ratio'] > self.min_fill_threshold,
                        "above_confidence_threshold": bubble['fill_ratio'] > self.confidence_threshold
                    })
                
                debug_info["row_analysis"].append(row_info)
            
            return debug_info
            
        except Exception as e:
            return {"error": str(e)}

# Utility functions for testing
def create_sample_omr_data(total_questions: int) -> Dict[str, str]:
    """Create sample OMR data for testing."""
    choices = ['A', 'B', 'C', 'D']
    answers = {}
    
    for i in range(1, total_questions + 1):
        answers[str(i)] = np.random.choice(choices)
    
    return answers

def validate_omr_format(file_path: str) -> bool:
    """Validate if the file is a supported OMR format."""
    if not os.path.exists(file_path):
        return False
    
    if not os.path.isfile(file_path):
        return False
        
    supported_extensions = ['.jpg', '.jpeg', '.png', '.pdf']
    file_extension = os.path.splitext(file_path)[1].lower()
    
    # Check file size (prevent empty or too large files)
    try:
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return False
        # Max size: 10MB
        if file_size > 10 * 1024 * 1024:
            return False
    except:
        return False
        
    return file_extension in supported_extensions

