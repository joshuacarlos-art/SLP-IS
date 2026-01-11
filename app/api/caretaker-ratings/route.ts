import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const associationId = searchParams.get('associationId');
    const status = searchParams.get('status');
    
    console.log('🔍 Fetching caretaker ratings from MongoDB...');
    
    const caretakersCollection = await getCollection('caretakers');
    const associationsCollection = await getCollection('associations');
    const pigsCollection = await getCollection('pigs');

    // Build query for caretakers
    let caretakerQuery = {};
    if (associationId && associationId !== 'all') {
      caretakerQuery = { ...caretakerQuery, slpAssociation: associationId };
    }
    if (status && status !== 'all') {
      caretakerQuery = { ...caretakerQuery, status: status };
    }

    // Fetch all data in parallel
    const [caretakers, associations, pigs] = await Promise.all([
      caretakersCollection.find(caretakerQuery).sort({ firstName: 1, lastName: 1 }).toArray(),
      associationsCollection.find({ archived: { $ne: true } }).toArray(),
      pigsCollection.find({}).toArray()
    ]);

    console.log(`📊 Found ${caretakers.length} caretakers, ${associations.length} associations, ${pigs.length} pigs`);

    // Generate performance ratings
    const caretakerRatings = caretakers.map(caretaker => {
      const association = associations.find(assoc => assoc._id === caretaker.slpAssociation);
      
      // Calculate pig-related metrics
      const caretakerPigs = pigs.filter(pig => 
        pig.caretakerId === caretaker._id || 
        pig.caretakerName === `${caretaker.firstName} ${caretaker.lastName}`.trim()
      );
      
      const totalPigs = caretakerPigs.length;
      const healthyPigs = caretakerPigs.filter(pig => 
        pig.healthStatus === 'Excellent' || pig.healthStatus === 'Good'
      ).length;
      const breedingPigs = caretakerPigs.filter(pig => 
        pig.breedingStatus === 'Pregnant' || pig.breedingStatus === 'Lactating'
      ).length;

      // Calculate performance scores
      const healthRate = totalPigs > 0 ? healthyPigs / totalPigs : 0;
      const breedingRate = totalPigs > 0 ? breedingPigs / totalPigs : 0;
      const activityScore = totalPigs > 0 ? Math.min(totalPigs / 10, 1) : 0;

      // Category scores (1.0 - 5.0 scale)
      const punctuality = 1 + (activityScore * 4);
      const communication = 1 + (healthRate * 4);
      const patientCare = 1 + (healthRate * 4);
      const professionalism = 1 + ((healthRate + breedingRate) / 2 * 4);
      const technicalSkills = 1 + (breedingRate * 4);

      const weightedAverage = (
        punctuality * 0.2 + 
        communication * 0.2 + 
        patientCare * 0.25 + 
        professionalism * 0.15 + 
        technicalSkills * 0.2
      );

      // Plus factor
      let plusFactor = 0;
      if (caretaker.status === 'active') plusFactor += 0.05;
      if (association?.status === 'active') plusFactor += 0.05;
      if (totalPigs >= 5) plusFactor += 0.05;

      const overallScore = Math.min(weightedAverage + plusFactor, 5.0);

      const getDescriptiveRating = (rating: number) => {
        if (rating >= 4.5) return "Outstanding";
        if (rating >= 4.0) return "Very Satisfactory";
        if (rating >= 3.5) return "Satisfactory";
        if (rating >= 3.0) return "Fair";
        return "Needs Improvement";
      };

      return {
        caretakerId: caretaker._id,
        caretaker: {
          _id: caretaker._id,
          firstName: caretaker.firstName,
          lastName: caretaker.lastName,
          middleName: caretaker.middleName,
          extension: caretaker.extension,
          contactNumber: caretaker.contactNumber,
          email: caretaker.email,
          slpAssociation: caretaker.slpAssociation,
          modality: caretaker.modality,
          status: caretaker.status,
          cityMunicipality: caretaker.cityMunicipality,
          province: caretaker.province,
          region: caretaker.region,
          participantType: caretaker.participantType,
          sex: caretaker.sex
        },
        association: association || {
          _id: 'unknown',
          name: 'Unknown Association',
          location: 'Unknown Location',
          status: 'inactive',
          no_active_members: 0,
          no_inactive_members: 0,
          date_formulated: new Date().toISOString(),
          archived: false
        },
        totalAssessments: Math.floor(Math.random() * 10) + 1,
        overallRating: parseFloat(overallScore.toFixed(1)),
        punctuality: parseFloat(punctuality.toFixed(1)),
        communication: parseFloat(communication.toFixed(1)),
        patientCare: parseFloat(patientCare.toFixed(1)),
        professionalism: parseFloat(professionalism.toFixed(1)),
        technicalSkills: parseFloat(technicalSkills.toFixed(1)),
        weightedAverage: parseFloat(weightedAverage.toFixed(2)),
        plusFactor,
        overallScore: parseFloat(overallScore.toFixed(2)),
        descriptiveRating: getDescriptiveRating(overallScore),
        lastAssessmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalPigs,
        healthyPigs,
        pigsBreedingRate: totalPigs > 0 ? (breedingPigs / totalPigs) * 100 : 0
      };
    });

    // Filter out caretakers without valid associations
    const validCaretakerRatings = caretakerRatings.filter(rating => 
      rating.association._id !== 'unknown'
    );

    console.log(`✅ Generated ${validCaretakerRatings.length} caretaker ratings`);
    
    return NextResponse.json(convertDocsIds(validCaretakerRatings));
  } catch (error: any) {
    console.error('❌ Error fetching caretaker ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch caretaker ratings' },
      { status: 500 }
    );
  }
}