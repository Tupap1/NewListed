"""
Database Migration: Add json_taxes to invoice_items table

Run this SQL in your MySQL database to add the new column for storing
tax information at the item level (not invoice level).
"""

-- Add json_taxes column to invoice_items table
ALTER TABLE invoice_items 
ADD COLUMN json_taxes TEXT NULL 
AFTER total_line;

-- Verify the change
DESCRIBE invoice_items;
