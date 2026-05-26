import type { Money, TeamCosts, Teammate, Trip } from "./types";
import { defaultTripDates } from "./dates";

function zeroMoney(currency = "EUR"): Money {
  return { amount: 0, currency };
}

export function newTeammate(name = "", homeAirport = ""): Teammate {
  return {
    id: crypto.randomUUID(),
    name,
    homeAirport: homeAirport.toUpperCase(),
    headcount: 1,
    travel: zeroMoney(),
    lodging: zeroMoney(),
    food: zeroMoney(),
  };
}

export function emptyTeamCosts(): TeamCosts {
  return {
    groupActivity: zeroMoney(),
    specialDinner: zeroMoney(),
    meetingRoom: zeroMoney(),
    misc: zeroMoney(),
  };
}

export function newTrip(): Trip {
  const { startDate, endDate } = defaultTripDates();
  return {
    id: crypto.randomUUID(),
    name: "Team Offsite",
    destinationCity: "",
    destinationAirport: "",
    startDate,
    endDate,
    budgetPerPerson: 2000,
    teammates: [newTeammate("", "")],
    teamCosts: emptyTeamCosts(),
    notes: "",
  };
}

export const TEAM_FIELDS: Array<{ key: keyof TeamCosts; label: string; hint?: string }> = [
  { key: "groupActivity", label: "Group activity", hint: "The headline offsite activity." },
  { key: "specialDinner", label: "Special team dinner", hint: "The one fancy group dinner." },
  { key: "meetingRoom", label: "Meeting room" },
  { key: "misc", label: "Misc team", hint: "Swag, taxis, etc." },
];
