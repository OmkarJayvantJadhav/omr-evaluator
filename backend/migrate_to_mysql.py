#!/usr/bin/env python3
"""
Migration script to migrate data from SQLite/PostgreSQL to MySQL
for the OMR Evaluator system.

This script will:
1. Connect to the source database (SQLite or PostgreSQL)
2. Connect to the target MySQL database
3. Export data from source and import to MySQL
4. Verify the migration

Usage:
    python migrate_to_mysql.py --source-db <source_database_url> --target-db <mysql_database_url>
    
Example:
    python migrate_to_mysql.py --source-db sqlite:///./omr_evaluator.db --target-db mysql+pymysql://omr_user:omr_password@localhost:3306/omr_evaluator
"""

import argparse
import sys
import os
from datetime import datetime
from typing import Dict, Any, List
import json

# Add current directory to path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, MetaData, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import models  # Import our models

def create_database_connection(database_url: str):
    """Create database engine and session"""
    try:
        # Configure engine based on database type
        if database_url.startswith("sqlite"):
            engine = create_engine(database_url, connect_args={"check_same_thread": False})
        elif database_url.startswith("mysql"):
            engine = create_engine(
                database_url,
                pool_size=5,
                max_overflow=10,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"charset": "utf8mb4", "autocommit": False},
                echo=False
            )
        else:  # PostgreSQL
            engine = create_engine(
                database_url,
                pool_size=5,
                max_overflow=10,
                pool_pre_ping=True,
                pool_recycle=300,
                echo=False
            )
        
        Session = sessionmaker(bind=engine)
        return engine, Session()
    except Exception as e:
        print(f"❌ Failed to connect to database {database_url}")
        print(f"Error: {e}")
        return None, None

def get_table_data(session, table_class) -> List[Dict[str, Any]]:
    """Extract all data from a table"""
    try:
        # Get all records
        records = session.query(table_class).all()
        
        # Convert to dictionaries
        data = []
        for record in records:
            record_dict = {}
            for column in table_class.__table__.columns:
                value = getattr(record, column.name)
                # Handle datetime objects
                if hasattr(value, 'isoformat'):
                    value = value.isoformat()
                record_dict[column.name] = value
            data.append(record_dict)
        
        return data
    except Exception as e:
        print(f"❌ Error extracting data from table {table_class.__tablename__}: {e}")
        return []

def insert_table_data(session, table_class, data: List[Dict[str, Any]]) -> bool:
    """Insert data into a table"""
    if not data:
        print(f"✅ No data to insert for table {table_class.__tablename__}")
        return True
    
    try:
        # Convert data back to model instances
        instances = []
        for record_dict in data:
            # Handle datetime strings
            for key, value in record_dict.items():
                if isinstance(value, str) and 'T' in value and ':' in value:
                    try:
                        from datetime import datetime
                        record_dict[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except:
                        pass  # Keep as string if not a valid datetime
            
            instance = table_class(**record_dict)
            instances.append(instance)
        
        # Bulk insert
        session.add_all(instances)
        session.commit()
        
        print(f"✅ Inserted {len(instances)} records into table {table_class.__tablename__}")
        return True
    except Exception as e:
        print(f"❌ Error inserting data into table {table_class.__tablename__}: {e}")
        session.rollback()
        return False

def backup_source_data(source_session) -> Dict[str, List[Dict[str, Any]]]:
    """Create a backup of all source data"""
    print("📦 Creating backup of source database...")
    
    backup_data = {}
    
    # Define the order of tables for migration (to handle foreign key dependencies)
    table_classes = [
        models.User,
        models.Teacher, 
        models.Student,
        models.Submission,
        models.ProcessedSubmission,
        models.SystemAuditLog
    ]
    
    for table_class in table_classes:
        print(f"  📋 Backing up {table_class.__tablename__}...")
        data = get_table_data(source_session, table_class)
        backup_data[table_class.__tablename__] = data
        print(f"    ✅ {len(data)} records backed up")
    
    # Save backup to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"database_backup_{timestamp}.json"
    
    try:
        with open(backup_filename, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, indent=2, default=str)
        print(f"✅ Backup saved to {backup_filename}")
    except Exception as e:
        print(f"⚠️  Could not save backup file: {e}")
    
    return backup_data

def migrate_data(source_session, target_engine, backup_data: Dict[str, List[Dict[str, Any]]]) -> bool:
    """Migrate data from source to target database"""
    print("🚚 Starting data migration to MySQL...")
    
    # Create target session
    target_session = sessionmaker(bind=target_engine)()
    
    try:
        # Create all tables in target database
        print("  🏗️  Creating tables in target database...")
        models.Base.metadata.create_all(bind=target_engine)
        print("    ✅ Tables created successfully")
        
        # Define migration order (same as backup order)
        table_classes = [
            models.User,
            models.Teacher, 
            models.Student,
            models.Submission,
            models.ProcessedSubmission,
            models.SystemAuditLog
        ]
        
        # Migrate each table
        for table_class in table_classes:
            table_name = table_class.__tablename__
            print(f"  📥 Migrating {table_name}...")
            
            data = backup_data.get(table_name, [])
            success = insert_table_data(target_session, table_class, data)
            
            if not success:
                print(f"❌ Migration failed at table {table_name}")
                return False
        
        print("✅ All data migrated successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        target_session.rollback()
        return False
    finally:
        target_session.close()

def verify_migration(source_session, target_engine, backup_data: Dict[str, List[Dict[str, Any]]]) -> bool:
    """Verify that migration was successful"""
    print("🔍 Verifying migration...")
    
    target_session = sessionmaker(bind=target_engine)()
    
    try:
        table_classes = [
            models.User,
            models.Teacher, 
            models.Student,
            models.Submission,
            models.ProcessedSubmission,
            models.SystemAuditLog
        ]
        
        for table_class in table_classes:
            table_name = table_class.__tablename__
            
            # Count records in source (from backup)
            source_count = len(backup_data.get(table_name, []))
            
            # Count records in target
            target_count = target_session.query(table_class).count()
            
            print(f"  📊 {table_name}: Source={source_count}, Target={target_count}")
            
            if source_count != target_count:
                print(f"❌ Record count mismatch for table {table_name}")
                return False
        
        print("✅ Migration verification successful!")
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False
    finally:
        target_session.close()

def main():
    parser = argparse.ArgumentParser(description='Migrate OMR Evaluator database to MySQL')
    parser.add_argument('--source-db', required=True, help='Source database URL')
    parser.add_argument('--target-db', required=True, help='Target MySQL database URL')
    parser.add_argument('--skip-backup', action='store_true', help='Skip creating backup file')
    
    args = parser.parse_args()
    
    print("🚀 Starting OMR Evaluator Database Migration to MySQL")
    print("=" * 60)
    print(f"Source: {args.source_db}")
    print(f"Target: {args.target_db}")
    print("=" * 60)
    
    # Connect to source database
    print("🔗 Connecting to source database...")
    source_engine, source_session = create_database_connection(args.source_db)
    if not source_session:
        sys.exit(1)
    print("✅ Connected to source database")
    
    # Connect to target database
    print("🔗 Connecting to target MySQL database...")
    target_engine, target_session = create_database_connection(args.target_db)
    if not target_session:
        sys.exit(1)
    print("✅ Connected to target database")
    target_session.close()  # We'll create new sessions as needed
    
    try:
        # Step 1: Backup source data
        backup_data = backup_source_data(source_session)
        
        # Step 2: Migrate data
        if migrate_data(source_session, target_engine, backup_data):
            # Step 3: Verify migration
            if verify_migration(source_session, target_engine, backup_data):
                print("\n🎉 Migration completed successfully!")
                print("\n📋 Next steps:")
                print("1. Update your .env file to use the new MySQL database URL")
                print("2. Test your application with the new database")
                print("3. Keep the backup file for rollback if needed")
            else:
                print("\n❌ Migration verification failed!")
                sys.exit(1)
        else:
            print("\n❌ Migration failed!")
            sys.exit(1)
    
    except Exception as e:
        print(f"\n❌ Unexpected error during migration: {e}")
        sys.exit(1)
    
    finally:
        # Clean up connections
        if source_session:
            source_session.close()
        if target_engine:
            target_engine.dispose()

if __name__ == "__main__":
    main()