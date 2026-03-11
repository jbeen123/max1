const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const states = ["TX", "FL", "GA", "NC", "AZ", "TN", "SC", "AL", "CO", "NV"];
const counties = {
  TX: ["Travis", "Harris", "Collin", "Denton", "Williamson", "Bexar", "Tarrant", "Henderson"],
  FL: ["Miami-Dade", "Broward", "Palm Beach", "Hillsborough", "Orange", "Duval"],
  GA: ["Fulton", "DeKalb", "Gwinnett", "Cobb", "Lumpkin", "Cherokee"],
  NC: ["Wake", "Mecklenburg", "Durham", "Guilford", "Forsyth"],
  AZ: ["Maricopa", "Pima", "Pinal", "Yavapai", "Coconino"],
  TN: ["Davidson", "Shelby", "Knox", "Hamilton", "Rutherford"],
  SC: ["Charleston", "Greenville", "Richland", "Horry"],
  AL: ["Jefferson", "Madison", "Mobile", "Baldwin"],
  CO: ["Denver", "El Paso", "Arapahoe", "Douglas", "Larimer"],
  NV: ["Clark", "Washoe", "Lyon", "Carson City"],
};
const zonings = ["Residential", "Agricultural", "Commercial", "Mixed-Use", "Industrial"];

const buyerNames = [
  "Marcus Thompson", "Sarah Williams", "Apex Builders LLC", "Jones Capital Group",
  "Michael Rivera", "Diamond Realty Trust", "CrestView Holdings", "Amanda Chen",
  "Blue Ridge Investments", "Robert Mitchell", "Pinnacle Land Corp", "Jasmine Parker",
  "NextGen Developers", "Thomas Blake", "SunCoast Capital", "Elena Rodriguez",
  "Keystone Property Group", "David Okafor", "Metro Land Partners", "Rachel Green",
  "Atlas Development Co", "Brandon Hughes", "Lakeside Investors LLC", "Patricia Kim",
  "Heritage Land Trust", "Omar Syed", "Vanguard Builders Inc", "Lisa Nguyen",
  "Crown Point Capital", "Derek Washington"
];

const sellerNames = [
  "John Carter", "Linda Estates", "Big Sky Ranch Co", "James O'Brien",
  "Maria Gonzalez", "Timber Creek Holdings", "Steven Park", "Rebecca Foster",
  "Lone Star Land LLC", "Patricia Hayes", "Valley View Properties", "Andrew Kim",
  "Sunset Acres Inc", "Dorothy Mitchell", "Frontier Land Group", "Charles Wu"
];

const listingTemplates = [
  { title: "{acres} Acres Wooded Lot - {county}, {state}", desc: "Beautiful wooded land with mature trees. Private road access. Well and septic approved. Perfect for custom home or investment hold.", zoning: "Residential" },
  { title: "{acres} Acres Raw Land - {county}, {state}", desc: "Flat cleared land with road frontage. All utilities at street. Subdivision potential. Survey available.", zoning: "Residential" },
  { title: "{acres} Acres Ranch Property - {county}, {state}", desc: "Working ranch with fencing, pond, and barn. AG exempt. Creek runs through property. Ideal for cattle or horses.", zoning: "Agricultural" },
  { title: "{acres} Acres Commercial Lot - {county}, {state}", desc: "High visibility commercial corner lot. Heavy traffic count. All utilities available. Phase I environmental complete.", zoning: "Commercial" },
  { title: "{acres} Acres Development Tract - {county}, {state}", desc: "Master-planned community potential. Preliminary plat approved for {units} lots. Infrastructure studies complete.", zoning: "Mixed-Use" },
  { title: "{acres} Acres Mountain View Parcel - {county}, {state}", desc: "Stunning panoramic views. Paved road access. Percolation test passed. Off-grid solar feasible.", zoning: "Residential" },
  { title: "{acres} Acres Lakefront Property - {county}, {state}", desc: "Private lake access with 200ft shoreline. Boat ramp nearby. Cleared building pad. Electricity at property line.", zoning: "Residential" },
  { title: "{acres} Acres Industrial Site - {county}, {state}", desc: "Rail-served industrial tract. Heavy power available. Zoned heavy industrial. Environmental Phase I clean.", zoning: "Industrial" },
  { title: "{acres} Acres Farm Land - {county}, {state}", desc: "Prime agricultural soil. Center pivot irrigation in place. Producing crop land. 1031 exchange eligible.", zoning: "Agricultural" },
  { title: "{acres} Acres Infill Lot - {county}, {state}", desc: "Urban infill opportunity in growing submarket. Surrounded by new construction. Entitled for {units}-unit multifamily.", zoning: "Mixed-Use" },
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randAcres() { return [1.5, 2.0, 3.2, 5.0, 7.5, 10, 12.5, 15, 20, 25, 40, 50, 80, 100, 160][Math.floor(Math.random() * 15)]; }
function priceForAcres(acres, zoning) {
  const base = zoning === "Commercial" ? 80000 : zoning === "Industrial" ? 40000 : zoning === "Mixed-Use" ? 60000 : 8000;
  return Math.round(acres * base * (0.7 + Math.random() * 0.8) / 1000) * 1000;
}

async function seed() {
  console.log("Seeding realistic data...");

  // Create buyers
  const buyers = [];
  for (let i = 0; i < buyerNames.length; i++) {
    const name = buyerNames[i];
    const email = name.toLowerCase().replace(/[^a-z0-9]/g, ".").replace(/\.+/g, ".") + "@mail.com";
    const state = rand(states);
    const user = await db.user.upsert({
      where: { email },
      update: {},
      create: { email, name, role: "BUYER", state, isVerified: Math.random() > 0.15 },
    });
    buyers.push(user);
  }
  console.log(`Created ${buyers.length} buyers`);

  // Create sellers
  const sellers = [];
  for (let i = 0; i < sellerNames.length; i++) {
    const name = sellerNames[i];
    const email = name.toLowerCase().replace(/[^a-z0-9]/g, ".").replace(/\.+/g, ".") + "@land.com";
    const state = rand(states);
    const user = await db.user.upsert({
      where: { email },
      update: {},
      create: { email, name, role: "SELLER", state, isVerified: Math.random() > 0.1 },
    });
    sellers.push(user);
  }
  console.log(`Created ${sellers.length} sellers`);

  // Create listings
  const properties = [];
  const statuses = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "PENDING_REVIEW", "UNDER_CONTRACT", "CLOSED", "DRAFT"];
  for (let i = 0; i < 35; i++) {
    const state = rand(states);
    const county = rand(counties[state]);
    const acres = randAcres();
    const template = rand(listingTemplates);
    const zoning = template.zoning;
    const price = priceForAcres(acres, zoning);
    const units = randInt(12, 80);
    const title = template.title.replace("{acres}", String(acres)).replace("{county}", county).replace("{state}", state);
    const desc = template.desc.replace("{units}", String(units));
    const seller = rand(sellers);
    const id = `prop-${String(i + 1).padStart(3, "0")}`;

    const prop = await db.property.upsert({
      where: { id },
      update: {},
      create: {
        id,
        sellerId: seller.id,
        title, description: desc,
        state, county,
        parcelId: `${state}-${county.slice(0, 3).toUpperCase()}-${String(randInt(10000, 99999))}`,
        zoning, lotSizeAcres: acres,
        askingPrice: price,
        assignmentAllowed: Math.random() > 0.4,
        status: rand(statuses),
      },
    });
    properties.push(prop);
  }
  console.log(`Created ${properties.length} listings`);

  // Create offers on active listings
  const activeProps = properties.filter(p => p.status === "ACTIVE" || p.status === "UNDER_CONTRACT");
  let offerCount = 0;
  for (const prop of activeProps) {
    const numOffers = randInt(0, 3);
    for (let j = 0; j < numOffers; j++) {
      const buyer = rand(buyers);
      const discount = 0.75 + Math.random() * 0.25;
      const amount = Math.round(prop.askingPrice * discount / 1000) * 1000;
      const msgs = [
        "Cash buyer, ready to close quickly",
        "Very interested. Can close in 30 days.",
        "All cash offer. Proof of funds available.",
        "Would like to inspect before closing.",
        "Contingent on survey and Phase I environmental.",
        "Serious investor. Multiple closings this quarter.",
        "Looking to develop. Can we discuss entitlements?",
      ];
      const offerStatuses = ["SUBMITTED", "SUBMITTED", "SUBMITTED", "COUNTERED", "ACCEPTED", "REJECTED", "WITHDRAWN"];
      const status = rand(offerStatuses);
      try {
        await db.offer.create({
          data: {
            propertyId: prop.id, buyerId: buyer.id,
            amount, message: rand(msgs), status,
            ...(status === "COUNTERED" ? { counterAmount: Math.round(amount * 1.08 / 1000) * 1000, counterMessage: "Close to asking and we have a deal." } : {}),
          },
        });
        offerCount++;
      } catch { /* skip dupes */ }
    }
  }
  console.log(`Created ${offerCount} offers`);

  // Create notifications for some users
  const notifTypes = [
    { type: "OFFER_RECEIVED", title: "New Offer Received", body: "You received a new offer on your listing" },
    { type: "OFFER_ACCEPTED", title: "Offer Accepted!", body: "Your offer has been accepted — proceed to closing" },
    { type: "LISTING_APPROVED", title: "Listing Approved", body: "Your property is now live on the marketplace" },
    { type: "KYC_VERIFIED", title: "Identity Verified", body: "Your identity has been verified successfully" },
    { type: "PAYMENT_RECEIVED", title: "Payment Received", body: "Earnest money deposit has been received" },
    { type: "CONTRACT_READY", title: "Contract Ready", body: "Your purchase agreement is ready for review" },
    { type: "SYSTEM", title: "Welcome to market.ai", body: "Your account is set up and ready to go" },
  ];
  let notifCount = 0;
  const allUsers = [...buyers, ...sellers];
  for (const user of allUsers) {
    const num = randInt(1, 4);
    for (let n = 0; n < num; n++) {
      const t = rand(notifTypes);
      await db.notification.create({
        data: { userId: user.id, type: t.type, title: t.title, body: t.body, readAt: Math.random() > 0.5 ? new Date() : null },
      });
      notifCount++;
    }
  }
  console.log(`Created ${notifCount} notifications`);

  // Create some conversations + messages
  let convCount = 0;
  for (let c = 0; c < 8; c++) {
    const buyer = rand(buyers);
    const seller = rand(sellers);
    const prop = rand(activeProps);
    try {
      const conv = await db.conversation.create({
        data: {
          propertyId: prop?.id,
          participants: { create: [{ userId: buyer.id }, { userId: seller.id }] },
        },
      });
      const exchanges = [
        [buyer.id, "Hi, I'm interested in your property. Is the price negotiable?"],
        [seller.id, "Thanks for reaching out! Yes, we're open to reasonable offers. What did you have in mind?"],
        [buyer.id, "I was thinking around " + Math.round(prop.askingPrice * 0.85 / 1000) * 1000 + ". Cash, quick close."],
        [seller.id, "That's a bit low. Could you come up to " + Math.round(prop.askingPrice * 0.93 / 1000) * 1000 + "?"],
        [buyer.id, "Let me think about it. Can I get the survey and environmental reports?"],
        [seller.id, "Sure, I'll have my agent send those over. Survey was done last year."],
      ];
      for (const [senderId, body] of exchanges) {
        await db.message.create({ data: { conversationId: conv.id, senderId, body } });
      }
      convCount++;
    } catch { /* skip */ }
  }
  console.log(`Created ${convCount} conversations with messages`);

  // Create some match scores
  let matchCount = 0;
  for (const prop of activeProps.slice(0, 15)) {
    const numMatches = randInt(2, 5);
    for (let m = 0; m < numMatches; m++) {
      const buyer = rand(buyers);
      try {
        await db.matchScore.create({
          data: {
            propertyId: prop.id, buyerId: buyer.id,
            score: Math.round((50 + Math.random() * 50) * 100) / 100,
            factors: {
              priceMatch: Math.round(Math.random() * 100),
              locationMatch: Math.round(Math.random() * 100),
              sizeMatch: Math.round(Math.random() * 100),
              zoningMatch: Math.round(Math.random() * 100),
            },
          },
        });
        matchCount++;
      } catch { /* skip dupes */ }
    }
  }
  console.log(`Created ${matchCount} match scores`);

  console.log("\n✅ Realistic data seeded!");
  await db.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
