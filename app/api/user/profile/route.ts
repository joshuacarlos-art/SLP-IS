import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getCollection, convertDocId } from '@/lib/mongodb';

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const profileData = formData.get('profile');
    const photo = formData.get('photo') as File | null;

    if (!profileData) {
      return NextResponse.json({ message: 'Profile data is required' }, { status: 400 });
    }

    const profile = JSON.parse(profileData as string);
    const userEmail = profile.email;

    if (!userEmail) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    let photoUrl = null;

    // Handle photo upload
    if (photo) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = photo.name.split('.').pop();
      const filename = `profile-${userEmail}-${timestamp}.${fileExtension}`;
      const filepath = join(uploadsDir, filename);

      // Save file
      await writeFile(filepath, buffer);
      photoUrl = `/uploads/profiles/${filename}`;
    }

    // Get profiles collection
    const profilesCollection = await getCollection('profiles');

    // Update or insert profile in MongoDB
    const result = await profilesCollection.updateOne(
      { email: userEmail },
      { 
        $set: {
          ...profile,
          photoUrl: photoUrl || undefined, // Only update photoUrl if new photo provided
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    // Get the updated profile
    const updatedProfile = await profilesCollection.findOne({ email: userEmail });

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: convertDocId(updatedProfile)
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email parameter is required' }, { status: 400 });
    }

    // Get profiles collection
    const profilesCollection = await getCollection('profiles');

    // Get profile from MongoDB
    const userProfile = await profilesCollection.findOne({ email });

    if (!userProfile) {
      // Return default profile if not found
      return NextResponse.json({ 
        message: 'Profile not found',
        profile: {
          name: "User",
          position: "",
          department: "",
          office: "",
          email: email,
          contact: "",
          location: "",
          employeeId: "",
          role: "",
          bio: ""
        }
      });
    }

    return NextResponse.json({
      profile: convertDocId(userProfile)
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email parameter is required' }, { status: 400 });
    }

    const profilesCollection = await getCollection('profiles');
    await profilesCollection.deleteOne({ email });

    return NextResponse.json({ 
      message: 'Profile deleted successfully'
    });

  } catch (error) {
    console.error('Profile delete error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}