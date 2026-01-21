# PetCare - Pet Care Management App

A comprehensive pet care management application built with Next.js, React, MongoDB, and Clerk authentication. Manage your pet's health, schedule daily care tasks, track appointments, and keep a shopping list for pet supplies.

## Features

✅ **User Authentication** - Secure login with Clerk
✅ **Pet Profiles** - Create detailed profiles for each pet with breed, age, medical history
✅ **Daily Care Planning** - Create recurring daily tasks and assign them to family members
✅ **Smart Calendar** - View appointments and events with FullCalendar integration
✅ **Appointment Management** - Schedule vet visits, grooming, walker, and training appointments
✅ **Health Tracking** - Track medications, vaccinations, and medical records
✅ **Shopping List** - Keep track of pet food, supplies, toys, and medications
✅ **Family Management** - Add multiple family members with different roles and responsibilities
✅ **Medical Records** - Upload and store medical records for each pet

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Calendar**: FullCalendar
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or cloud)
- Clerk account for authentication

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/animal-care-app

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/settings
```

### Setup Instructions

#### 1. MongoDB Setup

- Create a MongoDB database (Atlas recommended)
- Get your connection string
- Add it to `.env.local` as `MONGODB_URI`

#### 2. Clerk Setup

- Sign up at https://clerk.com
- Create a new application
- Get your API keys from the Clerk dashboard
- Add them to `.env.local`

#### 3. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Usage

### First Time Setup

1. Sign up or sign in with Clerk
2. Go to Settings to add family members
3. Add your pets in "My Pets"
4. Create daily care tasks in "Care Plan"
5. Schedule appointments in "Appointments"
6. Use the dashboard to view everything at a glance

### Creating a Pet Profile

1. Navigate to "My Pets"
2. Click "Add Pet"
3. Fill in:
   - Pet Name (required)
   - Animal Type (dog, cat, bird, etc.)
   - Breed
   - Age
   - Weight
   - Date of Birth

### Managing Daily Tasks

1. Go to "Care Plan"
2. Click "Add Task"
3. Select the pet and assign to a family member
4. Set the time and days of the week
5. Set priority level

### Scheduling Appointments

1. Navigate to "Appointments"
2. Click "Schedule Appointment"
3. Fill in appointment details:
   - Pet and appointment type
   - Date, time, and duration
   - Provider information (optional)
   - Set reminders
4. Appointments appear on the dashboard calendar

### Shopping List

1. Go to "Shopping"
2. Click "Add Item"
3. Fill in item details:
   - Item name and category
   - Quantity and unit
   - Priority level
   - Estimated cost
   - Associated pet (if applicable)
4. Check off items as you purchase them

## Database Schema

### Models

- **FamilyProfile**: Contains family information and references to pets and members
- **Pet**: Stores pet information, medical records, medications, vaccinations
- **Caretaker**: Family member profiles with roles
- **DailyTask**: Recurring daily care tasks
- **TaskInstance**: Individual task instances with completion status
- **Appointment**: Vet visits, grooming, walking, training appointments
- **ShoppingItem**: Shopping list items for pet supplies

## API Endpoints

### Pets

- `GET /api/pets` - Get all pets
- `POST /api/pets` - Create a new pet
- `GET /api/pets/[petId]` - Get pet details
- `PUT /api/pets/[petId]` - Update pet
- `DELETE /api/pets/[petId]` - Delete pet

### Appointments

- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/[appointmentId]` - Get appointment details
- `PUT /api/appointments/[appointmentId]` - Update appointment
- `DELETE /api/appointments/[appointmentId]` - Delete appointment

### Daily Tasks

- `GET /api/tasks` - Get all daily tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/[taskId]` - Get task details
- `PUT /api/tasks/[taskId]` - Update task
- `DELETE /api/tasks/[taskId]` - Delete task

### Task Instances

- `GET /api/tasks/instances` - Get task instances for a date
- `POST /api/tasks/instances` - Create task instance
- `PUT /api/tasks/instances/[instanceId]` - Mark task complete

### Shopping

- `GET /api/shopping` - Get shopping list
- `POST /api/shopping` - Add item
- `PUT /api/shopping/[itemId]` - Update item
- `DELETE /api/shopping/[itemId]` - Delete item

### Caretakers

- `GET /api/caretakers` - Get family members
- `POST /api/caretakers` - Add family member
- `GET /api/caretakers/[caretakerId]` - Get member details
- `PUT /api/caretakers/[caretakerId]` - Update member
- `DELETE /api/caretakers/[caretakerId]` - Remove member

### Family Profile

- `GET /api/family/profile` - Get family profile
- `POST /api/family/profile` - Create/update profile
- `PUT /api/family/profile` - Update profile

## File Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── pets/
│   │   ├── appointments/
│   │   ├── tasks/
│   │   ├── shopping/
│   │   ├── caretakers/
│   │   └── family/
│   ├── dashboard/           # Dashboard page
│   ├── pets/                # Pet management page
│   ├── care-plan/           # Daily care planning
│   ├── appointments/        # Appointment management
│   ├── shopping/            # Shopping list
│   ├── settings/            # Family & member settings
│   ├── layout.js
│   └── page.js              # Home page
├── components/
│   ├── Navbar.js
│   ├── DashboardCalendar.js
│   ├── PetManagement.js
│   ├── CarePlanTasks.js
│   ├── AppointmentScheduler.js
│   └── ShoppingList.js
├── models/
│   ├── familyProfile.js
│   ├── pet.js
│   ├── caretaker.js
│   ├── dailyTask.js
│   ├── taskInstance.js
│   ├── appointment.js
│   └── shoppingItem.js
└── lib/
    └── db.js                # MongoDB connection
```

## Build and Deployment

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm run start
```

### Deploy to Vercel

The easiest way to deploy is using Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Customization

### Styling

The app uses Tailwind CSS. Modify styles in component files or `globals.css`.

### Adding New Features

1. Create new models in `src/models/`
2. Create API routes in `src/app/api/`
3. Create React components in `src/components/`
4. Create pages in `src/app/`

## Troubleshooting

### MongoDB Connection Issues

- Verify `MONGODB_URI` is correct
- Check network access in MongoDB Atlas
- Ensure database user has proper permissions

### Clerk Authentication Issues

- Verify API keys are correct
- Check Clerk dashboard for settings
- Clear browser cache and cookies

### FullCalendar Display Issues

- Ensure CSS files are imported correctly
- Check browser console for errors
- Verify FullCalendar plugins are installed

## Future Enhancements

- [ ] Multiple pet household sharing
- [ ] Notification system for appointments and tasks
- [ ] Photo gallery for pets
- [ ] Vet expense tracking
- [ ] Pet nutrition and diet management
- [ ] Mobile app
- [ ] AI-powered pet health insights
- [ ] Integration with Stripe for premium features
- [ ] Pet training progress tracking
- [ ] Community forum for pet owners

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
