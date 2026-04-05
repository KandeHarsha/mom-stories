'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Heart } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <Card className="max-w-lg w-full shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="relative">
              <Heart className="h-16 w-16 text-pink-500 fill-pink-500" />
              <Smartphone className="h-8 w-8 text-purple-600 absolute -bottom-2 -right-2" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Mom Stories
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            We&apos;re going mobile-first!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800">
              For a Better Experience
            </h2>
            <p className="text-gray-600">
              Please use the <strong>Mom Stories mobile application</strong> for the best experience. 
              Our mobile app is optimized for tracking your precious memories on the go.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button variant="default" size="lg" className="gap-2" disabled>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              App Store
            </Button>
            
            <Button variant="default" size="lg" className="gap-2" disabled>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              Google Play
            </Button>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Admin access only
            </p>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Admin Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
