export interface CountryData {
  code: string;
  name: string;
  cities: string[];
}

export const COUNTRY_CITIES: CountryData[] = [
  {
    code: "CA",
    name: "Canada",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Halifax", "Victoria", "Mississauga", "Brampton", "Hamilton", "Surrey", "Kitchener", "London"],
  },
  {
    code: "US",
    name: "United States",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin", "Miami", "Atlanta", "Seattle", "Denver", "Boston", "Nashville", "Portland", "Las Vegas", "San Francisco", "Detroit"],
  },
  {
    code: "GB",
    name: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol", "Edinburgh", "Sheffield", "Nottingham", "Leicester", "Cardiff"],
  },
  {
    code: "AU",
    name: "Australia",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Hobart", "Darwin", "Newcastle"],
  },
  {
    code: "IN",
    name: "India",
    cities: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Chandigarh"],
  },
  {
    code: "AE",
    name: "UAE",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"],
  },
  {
    code: "DE",
    name: "Germany",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig"],
  },
  {
    code: "FR",
    name: "France",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Bordeaux", "Strasbourg"],
  },
  {
    code: "NL",
    name: "Netherlands",
    cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen"],
  },
  {
    code: "SG",
    name: "Singapore",
    cities: ["Singapore"],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],
  },
  {
    code: "PK",
    name: "Pakistan",
    cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"],
  },
  {
    code: "NZ",
    name: "New Zealand",
    cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin"],
  },
  {
    code: "IE",
    name: "Ireland",
    cities: ["Dublin", "Cork", "Limerick", "Galway", "Waterford"],
  },
  {
    code: "ZA",
    name: "South Africa",
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"],
  },
];
