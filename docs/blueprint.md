# **App Name**: SkinSense AI

## Core Features:

- Hero Section: Displays the app title, a brief tagline, and a prominent 'Upload Image' button to initiate the analysis.
- Image Upload and Preview: Allows users to upload an image and previews the selected image before submission.
- AI Diagnosis: Uploads the image to `/api/predict`, which returns diagnosis, confidence, information, and recommendation results.
- Diagnosis Display: Displays diagnosis, confidence (via progress bar), brief information, and a call-to-action based on the confidence level. Generates a recommendation tool
- Mock Mode: Simulates API response for demo or development purposes when the `/api/predict` endpoint is unavailable.

## Style Guidelines:

- Primary color: Soft blue (#A0D2EB) to evoke trust and calmness.
- Background color: Light gray (#F0F4F8) for a clean and modern feel.
- Accent color: Muted orange (#E5989B) for call-to-actions and highlighting important information.
- Body and headline font: 'Inter', sans-serif, for clear and accessible text.
- Use minimalist, line-style icons to represent different aspects of the diagnosis and recommendations.
- Mobile-first, single-page layout with rounded cards and subtle shadows for depth.
- Smooth transitions and subtle animations for feedback and visual enhancement.