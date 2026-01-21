# PetCare App - Quick Start Guide 🚀

## 5-Minute Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/settings
```

### Step 3: Start the Development Server

```bash
npm run dev
```

### Step 4: Open in Browser

Visit `http://localhost:3000`

---

## First Time User Guide

### 1. Create an Account

- Click "Get Started" or "Sign Up"
- Create your account with email or social login
- Complete your profile

### 2. Set Up Your Family

1. Go to **Settings** (gear icon)
2. View your family profile
3. Add family members by clicking "Add Member"
4. Fill in name, email, phone, and role
5. Save

### 3. Add Your Pets

1. Go to **My Pets**
2. Click "Add Pet"
3. Enter pet information:
   - Name (required)
   - Type (dog, cat, bird, etc.)
   - Breed
   - Age
   - Weight
   - Date of birth
4. Click "Add Pet"

### 4. Create Daily Care Tasks

1. Go to **Care Plan**
2. Click "Add Task"
3. Select:
   - Pet to care for
   - Caretaker to assign
   - Task name and type
   - Time of day
   - Days it repeats
   - Priority level
4. Click "Create Task"

### 5. Schedule Appointments

1. Go to **Appointments**
2. Click "Schedule Appointment"
3. Fill in:
   - Pet name
   - Appointment type (vet, groomer, walker, training)
   - Date and time
   - Provider info (optional but helpful)
   - Set reminders
4. Click "Schedule Appointment"

### 6. Manage Shopping List

1. Go to **Shopping**
2. Click "Add Item"
3. Enter:
   - Item name
   - Category (food, supplies, toys, etc.)
   - Quantity
   - Priority level
   - Estimated cost (optional)
4. Check off items as you buy them

### 7. View Dashboard

1. Go to **Dashboard**
2. See calendar with all appointments
3. View upcoming appointments
4. Check today's tasks
5. Mark tasks as complete

---

## Common Tasks

### How to Edit a Pet

1. Go to **My Pets**
2. Find the pet
3. Click the edit icon (pencil)
4. Update information
5. Click "Update Pet"

### How to Delete a Pet

1. Go to **My Pets**
2. Find the pet
3. Click the delete icon (trash)
4. Confirm deletion

### How to Add Family Members

1. Go to **Settings**
2. Click "Add Member"
3. Enter name, email, phone
4. Select role (primary/secondary/helper)
5. Click "Add"

### How to Track Medications

1. Go to **My Pets**
2. Click on pet details (view from pets list)
3. Add medication information to pet profile
4. Create a daily task for medication time

### How to Set Appointment Reminders

1. When scheduling appointment
2. Check "Enable reminder"
3. Select reminder time (15 min to 2 days before)
4. Appointment reminder will trigger before time

---

## Navigation Quick Reference

| Page         | URL             | Purpose                  |
| ------------ | --------------- | ------------------------ |
| Home         | `/`             | Landing page & marketing |
| Dashboard    | `/dashboard`    | Overview with calendar   |
| My Pets      | `/pets`         | Pet management           |
| Care Plan    | `/care-plan`    | Daily task management    |
| Appointments | `/appointments` | Schedule appointments    |
| Shopping     | `/shopping`     | Shopping list            |
| Settings     | `/settings`     | Family & members         |

---

## Keyboard Shortcuts

- Dashboard calendar: Use arrow keys to navigate dates
- Forms: Tab between fields, Enter to submit
- Mobile menu: Tap hamburger icon to open

---

## Tips & Tricks

✅ **Pro Tips**

- Set daily tasks for recurring activities (feeding, walking, medication)
- Use priority levels to highlight urgent items
- Link shopping items to specific pets
- Set appointment reminders so you don't forget
- Add provider contact info for easy access
- Check dashboard calendar daily for tasks and appointments
- Keep medical records updated
- Track vaccination dates and expirations

⚠️ **Best Practices**

- Use consistent pet names across system
- Keep provider contact info up to date
- Set realistic reminder times
- Review shopping list regularly
- Archive past appointments for reference
- Update pet ages annually

---

## Troubleshooting

### Can't Sign In

- Check that email is registered
- Try "Forgot Password" link
- Clear browser cache and cookies
- Try different browser

### Pet Not Appearing

- Refresh page (F5)
- Check you're logged in
- Verify pet was saved successfully

### Appointment Not on Calendar

- Check start and end dates are set correctly
- Refresh dashboard
- Verify pet is selected

### Task Not Showing Today

- Verify task is set for today's day of week
- Check time is correct
- Ensure caretaker is assigned

### Database Connection Error

- Verify MONGODB_URI in .env.local
- Check MongoDB is accessible
- Ensure network access is allowed
- Restart dev server

---

## Getting Help

### Documentation

- See `PETCARE_SETUP.md` for detailed setup
- See `IMPLEMENTATION_SUMMARY.md` for features overview
- See `CHECKLIST.md` for complete feature list

### Debugging

1. Check browser console for errors (F12)
2. Check terminal for server errors
3. Verify environment variables are set
4. Check MongoDB connection
5. Verify Clerk keys are correct

### Need More Help?

- Check the API endpoints in `PETCARE_SETUP.md`
- Review model schemas
- Check component prop types
- Look at error messages carefully

---

## Building & Deploying

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## Feature Overview

### ✨ What You Can Do

**Pet Management**

- Create and manage pet profiles
- Track breed, age, weight, birthday
- Store medical records
- Track vaccinations and medications

**Care Planning**

- Create daily recurring tasks
- Assign to family members
- Set time and frequency
- Priority levels

**Appointments**

- Schedule vet visits
- Book grooming appointments
- Arrange walker services
- Plan training sessions
- Get reminders

**Calendar View**

- Monthly, weekly, daily views
- See all appointments at once
- Visual organization

**Shopping**

- Track what you need
- Organize by category
- Estimate costs
- Check off when purchased

**Family Management**

- Multiple family members
- Different roles and responsibilities
- Contact tracking

---

## What's Next?

After setup:

1. ✅ Install dependencies
2. ✅ Add environment variables
3. ✅ Create an account
4. ✅ Add family members
5. ✅ Add your pets
6. ✅ Create daily tasks
7. ✅ Schedule appointments
8. ✅ Build your shopping list
9. ✅ Use the dashboard to stay organized
10. ✅ Share with family members

---

**You're all set! Start managing your pets better today! 🐾**
