# Checkinn

## Overview
An exclusive, invite-only dating application where users can only join through invitation links. The app features a member approval system and focuses on connecting creative professionals.

## Core Features

### Invitation System
- Users can generate and share invite links
- Only users with valid invite links can access the signup process
- Track invitation usage and source

### User Registration & Profiles
- New users sign up using invite links
- Profile creation includes:
  - Profile photos
  - Personal bio
  - Interests/hobbies
  - Creative field (music, film, fashion, tech, etc.)
- All new profiles require approval before activation

### Approval System
- New signups enter a pending state awaiting review
- Admin can approve or reject pending profiles
- Only approved profiles become active and visible to other users

### Member Discovery
- Swipe-style interface to browse approved member profiles
- Display profile photos, bio, interests, and creative field
- Users can like or pass on profiles

### Matching & Messaging
- When two users like each other, a match is created
- Matched users can send messages to each other
- Message history is preserved for each match

### Admin Dashboard
- View all pending profile approvals
- Approve or reject new member applications
- Manage user accounts and invitations
- Monitor app usage and member activity

## Data Storage (Backend)
- User profiles and account information
- Invitation links and usage tracking
- Match relationships between users
- Message history between matched users
- Admin approval decisions and pending requests
