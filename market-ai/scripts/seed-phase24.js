const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

// Unsplash land/real estate photos (no API key needed)
const landImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80",
  "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&q=80",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80",
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
  "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
  "https://images.unsplash.com/photo-1582407947304-fd86f28f96ef?w=800&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
];

const avatarImages = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80",
];

const buyerProfiles = [
  { name: "Marcus Thompson", company: "Thompson Capital Investments", phone: "(214) 555-0182", bio: "Private equity investor specializing in raw land acquisition and residential development across the Sun Belt. 15+ years experience. Cash buyer, fast closings." },
  { name: "Sarah Williams", company: "Williams Realty Trust", phone: "(305) 555-0247", bio: "Land investor and licensed realtor. Focus on Florida and Southeast markets. Interested in subdivisions, infill lots, and waterfront parcels." },
  { name: "Apex Builders LLC", company: "Apex Builders LLC", phone: "(404) 555-0319", bio: "Full-service residential builder. Purchasing entitled lots and raw development tracts. Building 50-200 homes per year across Georgia and the Carolinas." },
  { name: "Jones Capital Group", company: "Jones Capital Group", phone: "(704) 555-0453", bio: "Family office investing in land, commercial real estate, and agricultural properties. Long-term hold strategy. North Carolina and Virginia focus." },
  { name: "Michael Rivera", company: "Rivera Land Partners", phone: "(512) 555-0178", bio: "Texas-based land investor with 200+ transactions completed. Specializes in residential and commercial development tracts. Quick due diligence." },
  { name: "Diamond Realty Trust", company: "Diamond Realty Trust", phone: "(602) 555-0392", bio: "REIT focused on land banking and development in high-growth Southwest markets. Arizona, Nevada, Colorado. Institutional buyer." },
  { name: "CrestView Holdings", company: "CrestView Holdings LLC", phone: "(615) 555-0261", bio: "Tennessee-based developer buying raw land for master-planned communities. 1,000+ acres acquired in the last 3 years." },
  { name: "Amanda Chen", company: "Chen Investments", phone: "(919) 555-0584", bio: "Independent real estate investor. Focuses on undervalued agricultural and transitional land. NC and SC markets primarily." },
  { name: "Blue Ridge Investments", company: "Blue Ridge Investments", phone: "(828) 555-0137", bio: "Mountain and rural land specialists. Buying timber tracts, mountain parcels, and recreational land throughout Appalachia." },
  { name: "Robert Mitchell", company: "Mitchell Development Group", phone: "(713) 555-0496", bio: "Houston-based developer. Buying commercial and mixed-use land in high-growth Texas corridors. 20+ years in the industry." },
  { name: "Pinnacle Land Corp", company: "Pinnacle Land Corp", phone: "(480) 555-0328", bio: "National land acquisition firm. Purchasing 5-500 acre tracts for residential communities. Active in 12 states." },
  { name: "Jasmine Parker", company: "Parker Property Group", phone: "(843) 555-0671", bio: "South Carolina land investor. Specializes in coastal and Lowcountry properties. Cash buyer, 30-day closings." },
  { name: "NextGen Developers", company: "NextGen Developers Inc", phone: "(303) 555-0214", bio: "Colorado-based developer. Purchasing infill, suburban, and mountain lots. Focused on sustainable residential development." },
  { name: "Thomas Blake", company: "Blake Land Acquisitions", phone: "(251) 555-0388", bio: "Alabama investor with a focus on agricultural, timber, and transitional land. Buying statewide, cash offers." },
  { name: "SunCoast Capital", company: "SunCoast Capital LLC", phone: "(813) 555-0529", bio: "Florida land and development company. Active buyers in Tampa Bay, Orlando, and Jacksonville metro areas." },
  { name: "Elena Rodriguez", company: "Rodriguez Real Estate Group", phone: "(210) 555-0743", bio: "San Antonio-based land buyer and developer. Purchasing residential lots and development tracts in South Texas." },
  { name: "Keystone Property Group", company: "Keystone Property Group", phone: "(720) 555-0167", bio: "Denver metro land specialists. Acquiring sites for townhome, condo, and single-family residential development." },
  { name: "David Okafor", company: "Okafor Land Fund", phone: "(404) 555-0882", bio: "Atlanta-based investor. Purchasing transitional land in high-growth Georgia submarkets. 50+ acquisitions completed." },
  { name: "Metro Land Partners", company: "Metro Land Partners", phone: "(972) 555-0341", bio: "DFW-focused land acquisition and development company. Buying residential, commercial, and mixed-use tracts." },
  { name: "Rachel Green", company: "Green Acres Investments", phone: "(865) 555-0259", bio: "East Tennessee land investor. Focus on recreational land, rural tracts, and mountain properties." },
  { name: "Atlas Development Co", company: "Atlas Development Co", phone: "(702) 555-0614", bio: "Las Vegas and Nevada land developer. Purchasing raw desert land for master-planned residential communities." },
  { name: "Brandon Hughes", company: "Hughes Real Estate Capital", phone: "(901) 555-0478", bio: "Memphis-based real estate investor. Land and commercial properties throughout the Mid-South region." },
  { name: "Lakeside Investors LLC", company: "Lakeside Investors LLC", phone: "(256) 555-0193", bio: "Specializing in waterfront and lakefront properties across Alabama and Tennessee. Vacation and residential." },
  { name: "Patricia Kim", company: "Kim Capital Partners", phone: "(678) 555-0837", bio: "Metro Atlanta land buyer. Infill development specialist. Purchasing lots and small tracts for custom homes." },
  { name: "Heritage Land Trust", company: "Heritage Land Trust", phone: "(336) 555-0552", bio: "Conservation and investment land trust. Purchasing agricultural and timber land for long-term holds." },
  { name: "Omar Syed", company: "Syed Investment Group", phone: "(469) 555-0726", bio: "North Texas land investor. Purchasing development tracts in the DFW growth corridors. Fast cash closings." },
  { name: "Vanguard Builders Inc", company: "Vanguard Builders Inc", phone: "(770) 555-0394", bio: "Georgia residential builder. Buying finished lots and raw development tracts for single-family construction." },
  { name: "Lisa Nguyen", company: "Nguyen Property Investments", phone: "(571) 555-0861", bio: "Mid-Atlantic and Southeast land investor. Purchasing commercial and residential development sites." },
  { name: "Crown Point Capital", company: "Crown Point Capital", phone: "(615) 555-0247", bio: "Tennessee and Kentucky land investor. Focusing on agricultural, industrial, and commercial land acquisitions." },
  { name: "Derek Washington", company: "Washington Land Group", phone: "(919) 555-0583", bio: "North Carolina land buyer. 100+ transactions. Purchasing residential lots, raw land, and farm tracts statewide." },
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function seed() {
  console.log("Updating buyers with contact info + avatars...");
  for (const profile of buyerProfiles) {
    const email = profile.name.toLowerCase().replace(/[^a-z0-9]/g, ".").replace(/\.+/g, ".") + "@mail.com";
    await db.user.updateMany({
      where: { email },
      data: {
        company: profile.company,
        phone: profile.phone,
        bio: profile.bio,
        avatarUrl: rand(avatarImages),
      },
    });
  }
  console.log("Buyers updated.");

  console.log("Updating properties with cover images...");
  const properties = await db.property.findMany();
  for (const prop of properties) {
    const imgCount = Math.floor(Math.random() * 3) + 2;
    const imgs = Array.from({ length: imgCount }, () => rand(landImages));
    await db.property.update({
      where: { id: prop.id },
      data: {
        coverImage: imgs[0],
        images: imgs,
      },
    });
  }
  console.log(`Updated ${properties.length} properties with images.`);

  console.log("\n✅ Phase 24 seed complete!");
  await db.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
