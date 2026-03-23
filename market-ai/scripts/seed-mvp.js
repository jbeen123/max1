#!/usr/bin/env node
/**
 * Market-AI MVP Seed Script
 * Creates sample users and listings for testing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const STATES = ['TX', 'FL', 'AZ', 'TN', 'NC', 'GA', 'CO'];
const COUNTIES = {
  TX: ['Travis', 'Harris', 'Dallas', 'Bexar', 'Tarrant'],
  FL: ['Miami-Dade', 'Orange', 'Palm Beach', 'Broward', 'Hillsborough'],
  AZ: ['Maricopa', 'Pima', 'Pinal', 'Yavapai', 'Mohave'],
  TN: ['Davidson', 'Shelby', 'Knox', 'Hamilton', 'Rutherford'],
  NC: ['Wake', 'Mecklenburg', 'Guilford', 'Forsyth', 'Cumberland'],
  GA: ['Fulton', 'Gwinnett', 'Cobb', 'DeKalb', 'Chatham'],
  CO: ['Denver', 'El Paso', 'Arapahoe', 'Jefferson', 'Adams']
};
const ZONING = ['Residential', 'Agricultural', 'Commercial', 'Mixed-Use'];

const IMAGES = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a1?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a130?w=800&q=80'
];

const TITLES = [
  '5-Acre Rural Lot with Road Access',
  'Investment Property Near Growing City',
  'Scenic Hillside Acreage',
  'Commercial Development Opportunity',
  'Private Wooded Retreat',
  'Agricultural Land with Water Rights',
  'Lake View Property - Build Your Dream Home',
  'Undeveloped Parcel in Path of Growth',
  'Hunting Land with Mixed Timber',
  'Prime Location for Residential Development',
  'Ranch Land with Fencing and Wells',
  'Affordable Acreage for Homesteading'
];

const DESCRIPTIONS = [
  'Beautiful rural property with paved road access and utilities nearby. Perfect for building a home or holding as an investment. Survey completed in 2023.',
  'This property sits just outside a rapidly growing metropolitan area. Recent development in the area makes this an excellent long-term investment opportunity.',
  'Stunning views from this hillside property. Several buildable sites identified. Secluded yet accessible. Wildlife abundant.',
  'Zoned commercial with high traffic counts. Surrounded by new retail development. Owner financing available for qualified buyers.',
  'Escape to your own private retreat. Heavily wooded with mature timber. Trails throughout the property. Creek runs through the back corner.',
  'Established farmland with irrigation rights. Currently leased for hay production. Income producing property with excellent soil quality.',
  'Breathtaking lake views from this elevated parcel. Community boat ramp nearby. Restrictive covenants protect property values.',
  'Land banking opportunity in the path of growth. Current use is agricultural. Utilities at road. Purchase now before prices increase.',
  'Recreational property with excellent deer and turkey hunting. Mixed hardwood and pine timber. ATV trails throughout.',
  'Approved for 12-lot subdivision. Engineering and soil work completed. All utilities available. Ready to break ground.',
  'Working ranch with cross-fencing, working pens, and two water wells. Currently running 50 head. Minerals negotiable.',
  'Affordable acreage for those looking to get out of the city. Perfect for off-grid living or hobby farm. Seasonal creek.'
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  console.log('🌱 Starting MVP seed...\n');

  try {
    // Clean existing data (optional - comment out if you want to keep existing)
    console.log('Cleaning existing data...');
    await prisma.message.deleteMany({});
    await prisma.conversationParticipant.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✓ Cleaned existing data\n');

    // Create admin user
    console.log('Creating admin user...');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@marketai.com',
        name: 'Admin User',
        role: 'ADMIN',
        isVerified: true
      }
    });
    console.log(`✓ Admin: ${admin.email}\n`);

    // Create seller users
    console.log('Creating seller users...');
    const sellers = [];
    const sellerData = [
      { email: 'john@landseller.com', name: 'John Smith', company: 'Smith Land Holdings' },
      { email: 'sarah@properties.com', name: 'Sarah Johnson', company: 'Johnson Realty' },
      { email: 'mike@acres.com', name: 'Mike Davis', company: 'Davis Land Co' },
      { email: 'lisa@investments.com', name: 'Lisa Brown', company: 'Brown Investments' },
    ];

    for (const data of sellerData) {
      const seller = await prisma.user.create({
        data: {
          ...data,
          role: 'SELLER',
          isVerified: true,
          state: randomChoice(STATES),
          phone: `555-${randomInt(1000, 9999)}`
        }
      });
      sellers.push(seller);
      console.log(`  ✓ ${seller.name} (${seller.email})`);
    }

    // Create buyer users
    console.log('\nCreating buyer users...');
    const buyerData = [
      { email: 'buyer1@gmail.com', name: 'Alex Thompson' },
      { email: 'buyer2@gmail.com', name: 'Jordan Lee' },
      { email: 'investor@email.com', name: 'Sam Rodriguez' },
    ];

    for (const data of buyerData) {
      const buyer = await prisma.user.create({
        data: {
          ...data,
          role: 'BUYER',
          isVerified: true
        }
      });
      console.log(`  ✓ ${buyer.name} (${buyer.email})`);
    }

    // Create property listings
    console.log('\nCreating property listings...');
    const listings = [];

    // Create 8 active listings
    for (let i = 0; i < 8; i++) {
      const state = randomChoice(STATES);
      const county = randomChoice(COUNTIES[state]);
      const zoning = randomChoice(ZONING);
      const acres = randomInt(1, 100);
      const pricePerAcre = randomInt(3000, 25000);
      const price = acres * pricePerAcre;
      
      // Select 1-4 random images
      const numImages = randomInt(1, 4);
      const images = [];
      for (let j = 0; j < numImages; j++) {
        images.push(randomChoice(IMAGES));
      }

      const listing = await prisma.property.create({
        data: {
          sellerId: randomChoice(sellers).id,
          title: randomChoice(TITLES),
          description: randomChoice(DESCRIPTIONS),
          state,
          county,
          city: county + (randomInt(0, 1) ? ' City' : ''),
          askingPrice: price,
          lotSizeAcres: acres,
          zoning,
          images,
          coverImage: images[0],
          status: 'ACTIVE',
          assignmentAllowed: Math.random() > 0.7
        }
      });
      listings.push(listing);
      console.log(`  ✓ ${listing.title.slice(0, 40)}... ($${price.toLocaleString()})`);
    }

    // Create 3 pending listings
    console.log('\nCreating pending listings...');
    for (let i = 0; i < 3; i++) {
      const state = randomChoice(STATES);
      const county = randomChoice(COUNTIES[state]);
      const acres = randomInt(2, 50);
      const price = acres * randomInt(4000, 20000);
      
      const listing = await prisma.property.create({
        data: {
          sellerId: randomChoice(sellers).id,
          title: randomChoice(TITLES),
          description: randomChoice(DESCRIPTIONS),
          state,
          county,
          askingPrice: price,
          lotSizeAcres: acres,
          zoning: randomChoice(ZONING),
          images: [randomChoice(IMAGES)],
          coverImage: randomChoice(IMAGES),
          status: 'PENDING_REVIEW'
        }
      });
      console.log(`  ✓ ${listing.title.slice(0, 40)}... (PENDING)`);
    }

    // Create some conversations/messages
    console.log('\nCreating sample conversations...');
    const buyers = await prisma.user.findMany({ where: { role: 'BUYER' } });
    
    for (let i = 0; i < 3; i++) {
      const buyer = randomChoice(buyers);
      const property = randomChoice(listings);
      
      // Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          propertyId: property.id,
          participants: {
            create: [
              { userId: buyer.id },
              { userId: property.sellerId }
            ]
          }
        }
      });

      // Add messages
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: buyer.id,
          body: `Hi, I'm interested in your ${property.lotSizeAcres}-acre property in ${property.state}. Is it still available?`
        }
      });

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: property.sellerId,
          body: `Yes, it's still available! Would you like to schedule a time to view the property?`
        }
      });

      console.log(`  ✓ Conversation about "${property.title.slice(0, 30)}..."`);
    }

    // Create notifications
    console.log('\nCreating sample notifications...');
    for (const seller of sellers) {
      await prisma.notification.create({
        data: {
          userId: seller.id,
          type: 'LISTING_APPROVED',
          title: 'Your listing was approved',
          body: 'Your property is now live and visible to buyers.',
        }
      });
    }
    console.log(`  ✓ Created ${sellers.length} notifications`);

    // Summary
    console.log('\n📊 Seed Summary:');
    console.log('  Users:', await prisma.user.count());
    console.log('  Sellers:', await prisma.user.count({ where: { role: 'SELLER' } }));
    console.log('  Buyers:', await prisma.user.count({ where: { role: 'BUYER' } }));
    console.log('  Admin:', await prisma.user.count({ where: { role: 'ADMIN' } }));
    console.log('  Listings:', await prisma.property.count());
    console.log('    - Active:', await prisma.property.count({ where: { status: 'ACTIVE' } }));
    console.log('    - Pending:', await prisma.property.count({ where: { status: 'PENDING_REVIEW' } }));
    console.log('  Conversations:', await prisma.conversation.count());
    console.log('  Messages:', await prisma.message.count());
    console.log('  Notifications:', await prisma.notification.count());

    console.log('\n✅ MVP seed complete!');
    console.log('\n📧 Test Accounts:');
    console.log('  Admin:    admin@marketai.com');
    console.log('  Sellers:  john@landseller.com, sarah@properties.com, etc.');
    console.log('  Buyers:   buyer1@gmail.com, buyer2@gmail.com, etc.');

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
