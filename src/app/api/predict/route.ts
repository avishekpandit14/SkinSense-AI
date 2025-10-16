import { NextResponse } from 'next/server';

const mockResponses = [
  {
    diagnosis: 'Benign Keratosis-like Lesions (BKL)',
    confidence: 0.85,
    info: 'These are non-cancerous skin growths that are very common in adults. They often appear as waxy, brown, black, or tan growths.',
    recommend: 'Generally, no treatment is needed, but monitoring for changes is advised. Consult a professional for cosmetic removal.',
  },
  {
    diagnosis: 'Possible Melanocytic Nevus',
    confidence: 0.55,
    info: 'This is a type of mole formed by melanocytes. While most are benign, some have the potential to become cancerous.',
    recommend: 'Due to the lower confidence and nature of the condition, it is highly recommended to see a dermatologist for a professional evaluation.',
  },
  {
    diagnosis: 'Actinic Keratosis',
    confidence: 0.72,
    info: 'A rough, scaly patch on the skin that develops from years of exposure to the sun. It\'s most commonly found on your face, lips, ears, back of your hands, forearms, scalp or neck.',
    recommend: 'This is a pre-cancerous condition, so it is important to have it evaluated and treated by a dermatologist to prevent it from developing into skin cancer.',
  },
];

export async function POST(request: Request) {
  // Simulate network latency and processing time
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // In a real scenario, you would process the image from the request body.
  // const formData = await request.formData();
  // const image = formData.get('image');

  // Randomly fail sometimes to simulate real-world API issues
  if (Math.random() > 0.95) {
    return NextResponse.json({ error: 'Failed to analyze image. Please try again.' }, { status: 500 });
  }

  // Randomly pick a mock response
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

  return NextResponse.json(randomResponse);
}
