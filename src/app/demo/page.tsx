import type { Metadata } from 'next';
import DemoClient from './DemoClient';

export const metadata: Metadata = {
  title: 'Live Demo | Discovery Engine',
  description: 'Real-time vector search across science lab manufacturing products powered by Next.js, OpenAI & Pinecone.',
};

export default function Page() {
  return <DemoClient />;
}