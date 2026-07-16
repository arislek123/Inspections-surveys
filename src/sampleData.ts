/**
 * Initial clean database seed.
 * The app starts empty instead of loading fake demo cases/names.
 */

import { Case, Vessel, Port } from './types';

export const INITIAL_VESSELS: Vessel[] = [];

export const INITIAL_PORTS: Port[] = [];

export const INITIAL_JOB_TYPES: string[] = [
  'BWTS calibration',
  'BWTS sampling',
  'LSA/FFE inspection',
  'Liferaft service',
  'Fire extinguisher service',
  'CO2 system inspection',
  'SCBA / EEBD service',
  'VDR / GMDSS service',
  'Class survey',
  'Flag inspection',
  'Port State Control follow-up',
  'Hull / diving inspection',
  'Machinery service',
  'Safety equipment service',
  'Certificates / documents',
  'Other',
];

export const INITIAL_CASES: Case[] = [];
