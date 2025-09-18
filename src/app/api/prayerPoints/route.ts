import { supabaseService } from '@/services/supabase';
import { NextResponse } from 'next/server';
import { authoriseRequest } from '@/utils/authoriseRequest';
import { PrayerCategory, PrayerPoint, PrayerPointStatus } from '@/types/database';

export async function GET(request: Request) {
  const userId = (new URL(request.url)).searchParams.get('userId');
  const authResult = await authoriseRequest(
    request.headers.get('authorization'),
    userId,
  );
  
  // If authorization failed, return the error response
  if (authResult) {
    return authResult;
  }
  
  try {    
    // Fetch prayer categories for the specified user ID
    const prayerCategories = await supabaseService.getPrayerCategoriesByUserId(Number(userId));
    if (!prayerCategories || prayerCategories.length === 0) {
      return NextResponse.json(
        { 
          prayerCategories: [],
          prayerPoints: [] 
        },
        { status: 200 }
      );
    }
    // Fetch prayer points for each category
    const prayerPointsPromises = prayerCategories.map(async (category) => {
      const points = await supabaseService.getPrayerPointsByCategoryId(category.id);
      return {
        ...category,
        prayerPoints: points || [],
      };
    }).flat();
    const resolvedPrayerPoints = await Promise.all(prayerPointsPromises);
    return NextResponse.json(
      { 
        prayerCategories: prayerCategories,
        prayerPoints: resolvedPrayerPoints 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching prayer points:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve prayer points' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const userId = (new URL(request.url)).searchParams.get('userId');
  const authResult = await authoriseRequest(
    request.headers.get('authorization'),
    userId,
  );
  
  // If authorization failed, return the error response
  if (authResult) {
    return authResult;
  }
  
  try {
    // Get prayerCategories and prayerPoints from the request body
    const { prayerCategories, prayerPoints } = await request.json();

    // Create prayer categories and collect the results
    const createdCategories: PrayerCategory[] = [];
    if (prayerCategories && prayerCategories.length > 0) {
      const categoryPromises = prayerCategories.map(async (category: { name: string }) => {
        // Create a new prayer category for the user
        const newCategory = await supabaseService.createPrayerCategory(
          Number(userId),
          category.name
        );
        return newCategory;
      });
      createdCategories.push(...await Promise.all(categoryPromises));
    }

    // Create prayer points and collect the results
    const createdPrayerPoints: PrayerPoint[] = [];
    if (prayerPoints && prayerPoints.length > 0) {
      const pointPromises = prayerPoints.map(async (point: { categoryId: number, content: string }) => {
        // Create a new prayer point for the specified category
        const newPoint = await supabaseService.createPrayerPoint(
          point.categoryId,
          point.content
        );
        return newPoint;
      });
      createdPrayerPoints.push(...await Promise.all(pointPromises));
    }

    return NextResponse.json(
      { 
        message: 'Prayer points created successfully',
        createdCategories,
        createdPrayerPoints
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating prayer points:', error);
    return NextResponse.json(
      { error: 'Failed to create prayer points' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const authResult = await authoriseRequest(
    request.headers.get('authorization'),
    (new URL(request.url)).searchParams.get('userId'),
  );
  
  // If authorization failed, return the error response
  if (authResult) {
    return authResult;
  }
  
  const { prayerCategoryId, prayerPointId } = await request.json();
  if (!prayerCategoryId && !prayerPointId) {
    return NextResponse.json(
      { error: 'Either prayerCategoryId or prayerPointId must be provided' },
      { status: 400 }
    );
  } else if (prayerCategoryId && prayerPointId) {
    return NextResponse.json(
      { error: 'Only one of prayerCategoryId or prayerPointId should be provided' },
      { status: 400 }
    );
  }
  try {
    if (prayerCategoryId) {
      // Delete the specified prayer category
      await supabaseService.deletePrayerCategory(prayerCategoryId);
      return NextResponse.json(
        { message: 'Prayer category deleted successfully' },
        { status: 200 }
      );
    } else if (prayerPointId) {
      // Delete the specified prayer point
      await supabaseService.deletePrayerPoint(prayerPointId);
      return NextResponse.json(
        { message: 'Prayer point deleted successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error deleting prayer point:', error);
    return NextResponse.json(
      { error: 'Failed to delete prayer point' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authResult = await authoriseRequest(
    request.headers.get('authorization'),
    (new URL(request.url)).searchParams.get('userId'),
  );
  
  // If authorization failed, return the error response
  if (authResult) {
    return authResult;
  }
  
  try {
    // Get prayerCategories and prayerPoints from the request body
    const { prayerCategories, prayerPoints } = await request.json();
    
    // Update prayer categories if provided
    if (prayerCategories && prayerCategories.length > 0) {
      for (const category of prayerCategories) {
        if (!category.id || !category.name) {
          return NextResponse.json(
            { error: 'Category ID and name are required for updates' },
            { status: 400 }
          );
        }
      }
      
      const categoryUpdates = prayerCategories.map(async (category: { id: number, name: string }) => {
        return await supabaseService.updatePrayerCategory(category.id, category.name);
      });
      await Promise.all(categoryUpdates);
    }
    
    // Update prayer points if provided
    if (prayerPoints && prayerPoints.length > 0) {
      for (const point of prayerPoints) {
        if (!point.id) {
          return NextResponse.json(
            { error: 'Prayer point ID is required for updates' },
            { status: 400 }
          );
        }
        
        // Validate status if it's provided
        if (point.status !== undefined) {
          const validStatusValues = Object.values(PrayerPointStatus);
          if (!validStatusValues.includes(point.status as PrayerPointStatus)) {
            return NextResponse.json(
              { error: `Invalid status value. Must be one of: ${validStatusValues.join(', ')}` },
              { status: 400 }
            );
          }
        }
      }
      
      const pointUpdates = prayerPoints.map(async (point: { 
        id: number,
        categoryId?: number,
        content?: string,
        status?: PrayerPointStatus,
        lastTimePrayed?: string
      }) => {
        return await supabaseService.updatePrayerPoint(
          point.id,
          point.categoryId,
          point.content,
          point.status,
          point.lastTimePrayed
        );
      });
      await Promise.all(pointUpdates);
    }

    return NextResponse.json(
      { message: 'Prayer items updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating prayer items:', error);
    return NextResponse.json(
      { error: 'Failed to update prayer items', details: (error as Error).message },
      { status: 500 }
    );
  }
}


