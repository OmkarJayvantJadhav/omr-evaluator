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
        self.confidence_threshold = 0.3
        self.bubble_min_area = 50
        self.bubble_max_area = 10000
        self.aspect_ratio_threshold = 0.7
        self.circularity_threshold = 0.1
        
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
        """Preprocess the image for better bubble detection."""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Method 1: Adaptive threshold
        thresh1 = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 21, 10
        )
        
        # Method 2: Otsu's method for global thresholding
        _, thresh2 = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Method 3: Simple threshold for dark bubbles (works well for colored bubbles)
        _, thresh3 = cv2.threshold(blurred, 150, 255, cv2.THRESH_BINARY_INV)
        
        # Method 4: Color-based detection for purple/blue bubbles
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        # Purple/Blue color range
        lower_purple = np.array([100, 50, 50])
        upper_purple = np.array([160, 255, 255])
        color_mask = cv2.inRange(hsv, lower_purple, upper_purple)
        
        # Combine all methods using bitwise OR to catch more bubbles
        thresh = cv2.bitwise_or(thresh1, thresh2)
        thresh = cv2.bitwise_or(thresh, thresh3)
        thresh = cv2.bitwise_or(thresh, color_mask)
        
        # Apply morphological operations to clean up and fill holes
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel, iterations=1)
        
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
        
        # Calculate dynamic area thresholds based on image size
        image_area = image.shape[0] * image.shape[1]
        dynamic_min_area = max(self.bubble_min_area, image_area * 0.00003)
        dynamic_max_area = min(self.bubble_max_area, image_area * 0.02)
        
        print(f"Image area: {image_area}")
        print(f"Dynamic min area: {dynamic_min_area}")
        print(f"Dynamic max area: {dynamic_max_area}")
        print(f"Total contours to filter: {len(contours)}")
        
        # Debug counters
        filtered_by_area = 0
        filtered_by_circularity = 0
        filtered_by_aspect_ratio = 0
        
        for contour in contours:
            # Calculate contour properties
            area = cv2.contourArea(contour)
            if area < dynamic_min_area or area > dynamic_max_area:
                filtered_by_area += 1
                continue
            
            # Check if contour is roughly circular
            perimeter = cv2.arcLength(contour, True)
            if perimeter == 0:
                continue
            
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            if circularity < self.circularity_threshold:  # Not circular enough
                filtered_by_circularity += 1
                continue
            
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)
            if w == 0 or h == 0:
                continue
                
            aspect_ratio = float(w) / h
            if abs(aspect_ratio - 1.0) > self.aspect_ratio_threshold:
                filtered_by_aspect_ratio += 1
                continue
            
            # Calculate fill ratio (how much of the bubble is filled)
            mask = np.zeros(image.shape, dtype=np.uint8)
            cv2.drawContours(mask, [contour], -1, 255, -1)
            filled_pixels = cv2.countNonZero(cv2.bitwise_and(image, mask))
            
            # Use bounding box area for more accurate fill ratio
            roi_area = w * h
            fill_ratio = filled_pixels / roi_area if roi_area > 0 else 0
            
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
        
        # Print debug info
        print(f"Filtered by area: {filtered_by_area}")
        print(f"Filtered by circularity: {filtered_by_circularity}")
        print(f"Filtered by aspect ratio: {filtered_by_aspect_ratio}")
        print(f"Valid bubbles found: {len(bubbles)}")
        
        return bubbles
    
    def _extract_answers(self, bubbles: List[Dict], total_questions: int, number_of_choices: int = 4) -> Dict[str, str]:
        """Extract answers from detected bubbles."""
        answers = {}
        
        if not bubbles:
            return answers
        
        # Group bubbles by rows (questions)
        rows = self._group_bubbles_by_rows(bubbles)
        
        # Generate choices based on number_of_choices (A, B, C, D for 4, A, B, C, D, E for 5, etc.)
        choices = [chr(ord('A') + i) for i in range(number_of_choices)]
        
        question_num = 1
        for row in rows[:total_questions]:  # Limit to expected number of questions
            if not row:
                continue
            
            # Sort bubbles in row by x-coordinate (left to right)
            row.sort(key=lambda b: b['center'][0])
            
            # Find the most filled bubble in this row
            max_fill_ratio = 0
            selected_choice = None
            
            for i, bubble in enumerate(row[:number_of_choices]):  # Limit to configured number of choices
                if bubble['fill_ratio'] > max_fill_ratio and bubble['fill_ratio'] > self.confidence_threshold:
                    max_fill_ratio = bubble['fill_ratio']
                    selected_choice = choices[i] if i < len(choices) else None
            
            if selected_choice:
                answers[str(question_num)] = selected_choice
            
            question_num += 1
        
        return answers
    
    def _group_bubbles_by_rows(self, bubbles: List[Dict]) -> List[List[Dict]]:
        """Group bubbles into rows based on y-coordinate."""
        if not bubbles:
            return []
        
        # Calculate dynamic row threshold based on average bubble height
        avg_height = np.mean([b['bounding_box'][3] for b in bubbles])
        row_threshold = max(30, avg_height * 0.8)  # pixels
        
        rows = []
        current_row = [bubbles[0]]
        
        for bubble in bubbles[1:]:
            # Check if bubble is in the same row as current row
            # Use average y-coordinate of current row for better grouping
            current_row_y = np.mean([b['center'][1] for b in current_row])
            bubble_y = bubble['center'][1]
            
            if abs(bubble_y - current_row_y) <= row_threshold:
                current_row.append(bubble)
            else:
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

