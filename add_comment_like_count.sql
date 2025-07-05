-- Migration to add like_count column to comments table
-- This migration adds comment like count tracking

-- Add like_count column to comments table
alter table comments add column like_count

int;