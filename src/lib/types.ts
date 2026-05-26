export type Money = {
  amount: number;
  currency: string;
};

export type Teammate = {
  id: string;
  name: string;
  homeAirport: string;
  // Number of people this entry represents. Costs are entered per-person and multiplied. Defaults to 1.
  headcount?: number;
  travel: Money;
  lodging: Money;
  food: Money;
};

export type TeamCosts = {
  groupActivity: Money;
  specialDinner: Money;
  meetingRoom: Money;
  misc: Money;
};

export type Trip = {
  id: string;
  name: string;
  destinationCity: string;
  destinationAirport: string;
  startDate: string;
  endDate: string;
  budgetPerPerson: number; // always EUR
  teammates: Teammate[];
  teamCosts: TeamCosts;
  // Free-form notes that travel with the trip when exported.
  notes?: string;
  // User-overridden FX rates: currency code → units of EUR per 1 unit of currency.
  fxOverrides?: Record<string, number>;
};

export type PersonBreakdown = {
  teammate: Teammate;
  travelEUR: number;
  lodgingEUR: number;
  foodEUR: number;
  totalEUR: number;
};

export type TripSummary = {
  headcount: number;
  poolEUR: number;
  personalSpendEUR: number;
  teamSpendEUR: number;
  totalSpendEUR: number;
  varianceEUR: number;
  perPerson: PersonBreakdown[];
};
