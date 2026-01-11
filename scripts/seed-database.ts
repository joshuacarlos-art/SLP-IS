import { getCollection } from '@/lib/mongodb';

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Sample associations
    const associations = [
      {
        name: 'Farmers Cooperative Association',
        status: 'active',
        dateFormulated: new Date('2020-03-15'),
        operationalReason: 'Agricultural development and member support',
        activeMembers: 45,
        inactiveMembers: 5,
        covidAffected: true,
        hasProfitSharing: true,
        hasLoanScheme: true,
        registrationsCertifications: ['DOLE Registered', 'SEC Registered'],
        finalOrgAdjectivalRating: 'Excellent',
        finalOrgRatingAssessment: 'Highly functional with strong leadership',
        location: 'Barangay San Juan, Municipality A',
        contactPerson: 'Juan Dela Cruz',
        contactNumber: '+639123456789',
        email: 'farmers.coop@email.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Women Weavers Association',
        status: 'active',
        dateFormulated: new Date('2019-07-20'),
        operationalReason: 'Preservation of traditional weaving techniques',
        activeMembers: 32,
        inactiveMembers: 3,
        covidAffected: true,
        hasProfitSharing: true,
        hasLoanScheme: false,
        registrationsCertifications: ['DTI Registered', 'LGU Accredited'],
        finalOrgAdjectivalRating: 'Very Good',
        finalOrgRatingAssessment: 'Stable operations with good member participation',
        location: 'Barangay Maria, Municipality B',
        contactPerson: 'Maria Santos',
        contactNumber: '+639987654321',
        email: 'weavers.association@email.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fisherfolks Alliance',
        status: 'active',
        dateFormulated: new Date('2021-01-10'),
        operationalReason: 'Sustainable fishing and market access',
        activeMembers: 28,
        inactiveMembers: 7,
        covidAffected: false,
        hasProfitSharing: false,
        hasLoanScheme: true,
        registrationsCertifications: ['BFAR Licensed', 'Cooperative Registered'],
        finalOrgAdjectivalRating: 'Good',
        finalOrgRatingAssessment: 'Developing organization with potential',
        location: 'Coastal Barangay, Municipality C',
        contactPerson: 'Pedro Reyes',
        contactNumber: '+639456789123',
        email: 'fisherfolk.alliance@email.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const associationsCollection = await getCollection('associations');
    await associationsCollection.deleteMany({}); // Clear existing data
    const associationResult = await associationsCollection.insertMany(associations);
    console.log('✓ Associations seeded');

    // Get the inserted association IDs
    const insertedAssociations = await associationsCollection.find({}).toArray();
    
    const farmersAssociation = insertedAssociations.find(a => a.name === 'Farmers Cooperative Association');
    const weaversAssociation = insertedAssociations.find(a => a.name === 'Women Weavers Association');
    const fisherfolksAssociation = insertedAssociations.find(a => a.name === 'Fisherfolks Alliance');

    if (!farmersAssociation || !weaversAssociation || !fisherfolksAssociation) {
      throw new Error('Failed to find inserted associations');
    }

    // Sample financial reports
    const financialReports = [
      {
        associationId: farmersAssociation._id.toString(),
        associationName: 'Farmers Cooperative Association',
        period: '2024-Q1',
        sales: 150000,
        costs: 80000,
        profit: 70000,
        share80: 56000,
        assShare20: 14000,
        monitoring2: 1400,
        expenses: 10000,
        balance: 58600,
        reportDate: new Date('2024-03-31'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        associationId: farmersAssociation._id.toString(),
        associationName: 'Farmers Cooperative Association',
        period: '2023-Q4',
        sales: 120000,
        costs: 70000,
        profit: 50000,
        share80: 40000,
        assShare20: 10000,
        monitoring2: 1000,
        expenses: 8000,
        balance: 41000,
        reportDate: new Date('2023-12-31'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        associationId: weaversAssociation._id.toString(),
        associationName: 'Women Weavers Association',
        period: '2024-Q1',
        sales: 80000,
        costs: 45000,
        profit: 35000,
        share80: 28000,
        assShare20: 7000,
        monitoring2: 700,
        expenses: 5000,
        balance: 29300,
        reportDate: new Date('2024-03-31'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        associationId: fisherfolksAssociation._id.toString(),
        associationName: 'Fisherfolks Alliance',
        period: '2024-Q1',
        sales: 60000,
        costs: 40000,
        profit: 20000,
        share80: 16000,
        assShare20: 4000,
        monitoring2: 400,
        expenses: 3000,
        balance: 16600,
        reportDate: new Date('2024-03-31'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const financialReportsCollection = await getCollection('financial_reports');
    await financialReportsCollection.deleteMany({});
    await financialReportsCollection.insertMany(financialReports);
    console.log('✓ Financial reports seeded');

    // Sample ratings
    const ratings = [
      {
        associationId: farmersAssociation._id.toString(),
        associationName: 'Farmers Cooperative Association',
        ratingPeriod: '2024-Q1',
        overallRating: 4.5,
        adjectivalRating: 'Excellent',
        financialPerformance: 4.8,
        operationalEfficiency: 4.2,
        memberSatisfaction: 4.6,
        complianceScore: 4.4,
        assessments: [
          {
            category: 'Financial Management',
            score: 4.8,
            maxScore: 5,
            description: 'Excellent financial controls and reporting with transparent profit sharing'
          },
          {
            category: 'Operational Efficiency',
            score: 4.2,
            maxScore: 5,
            description: 'Good operational processes with efficient resource allocation'
          },
          {
            category: 'Member Services',
            score: 4.6,
            maxScore: 5,
            description: 'High member satisfaction and active participation in activities'
          },
          {
            category: 'Compliance & Governance',
            score: 4.4,
            maxScore: 5,
            description: 'Strong compliance with regulations and effective governance structure'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        associationId: weaversAssociation._id.toString(),
        associationName: 'Women Weavers Association',
        ratingPeriod: '2024-Q1',
        overallRating: 4.2,
        adjectivalRating: 'Very Good',
        financialPerformance: 4.0,
        operationalEfficiency: 4.3,
        memberSatisfaction: 4.5,
        complianceScore: 4.1,
        assessments: [
          {
            category: 'Financial Management',
            score: 4.0,
            maxScore: 5,
            description: 'Good financial management with consistent profit generation'
          },
          {
            category: 'Operational Efficiency',
            score: 4.3,
            maxScore: 5,
            description: 'Efficient production processes and quality control'
          },
          {
            category: 'Member Services',
            score: 4.5,
            maxScore: 5,
            description: 'Strong member engagement and skill development programs'
          },
          {
            category: 'Compliance & Governance',
            score: 4.1,
            maxScore: 5,
            description: 'Good compliance record with minor documentation issues'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        associationId: fisherfolksAssociation._id.toString(),
        associationName: 'Fisherfolks Alliance',
        ratingPeriod: '2024-Q1',
        overallRating: 3.8,
        adjectivalRating: 'Good',
        financialPerformance: 3.5,
        operationalEfficiency: 3.9,
        memberSatisfaction: 4.0,
        complianceScore: 3.8,
        assessments: [
          {
            category: 'Financial Management',
            score: 3.5,
            maxScore: 5,
            description: 'Adequate financial management with room for improvement in reporting'
          },
          {
            category: 'Operational Efficiency',
            score: 3.9,
            maxScore: 5,
            description: 'Reasonable operational efficiency considering seasonal challenges'
          },
          {
            category: 'Member Services',
            score: 4.0,
            maxScore: 5,
            description: 'Satisfactory member services with good communication'
          },
          {
            category: 'Compliance & Governance',
            score: 3.8,
            maxScore: 5,
            description: 'Basic compliance met, governance structure needs strengthening'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const ratingsCollection = await getCollection('association_ratings');
    await ratingsCollection.deleteMany({});
    await ratingsCollection.insertMany(ratings);
    console.log('✓ Ratings seeded');

    console.log('✓ Database seeding completed successfully!');
    console.log(`✓ Created ${insertedAssociations.length} associations`);
    console.log(`✓ Created ${financialReports.length} financial reports`);
    console.log(`✓ Created ${ratings.length} ratings`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };