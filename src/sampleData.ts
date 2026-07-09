/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Case, Vessel, Port } from './types';

export const INITIAL_VESSELS: Vessel[] = [
  { id: 'v-1', name: 'M/V STEFANOS', imo: '9428574', fleet: 'Bulk Carrier Fleet A' },
  { id: 'v-2', name: 'M/V IRINA', imo: '9653248', fleet: 'Tanker Division B' },
  { id: 'v-3', name: 'M/V DANAE', imo: '9312294', fleet: 'Bulk Carrier Fleet B' },
  { id: 'v-4', name: 'M/V ALLIANCE', imo: '9841263', fleet: 'Container Division A' },
  { id: 'v-5', name: 'M/V ODYSSEUS', imo: '9511142', fleet: 'Bulk Carrier Fleet A' },
];

export const INITIAL_PORTS: Port[] = [
  { id: 'p-1', name: 'Singapore', country: 'Singapore' },
  { id: 'p-2', name: 'Santos', country: 'Brazil' },
  { id: 'p-3', name: 'Tuticorin', country: 'India' },
  { id: 'p-4', name: 'Rotterdam', country: 'Netherlands' },
  { id: 'p-5', name: 'Houston', country: 'USA' },
  { id: 'p-6', name: 'Shanghai', country: 'China' },
];

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

export const INITIAL_CASES: Case[] = [
  {
    id: 'CASE-2026-001',
    vesselId: 'v-1', // M/V STEFANOS
    portId: 'p-1', // Singapore
    jobType: 'BWTS calibration',
    subject: 'Urgent Ballast Water Treatment System (BWTS) Calibration',
    responsiblePerson: 'John Mercer (Technical Supt)',
    status: 'Urgent',
    priority: 'Critical',
    createdDate: '2026-07-01T10:00:00Z',
    lastUpdatedDate: '2026-07-04T15:30:00Z',
    deadline: '2026-07-10',
    details: 'The BWTS filter pressure sensors on M/V STEFANOS have shown repeated alarm warnings during last ballast operations. Calibration of the flow meter and differential pressure sensors must be conducted in Singapore by an approved maker service engineer to ensure compliance before entering US waters.',
    nextAction: 'Confirm service engineer attendance details with maker and port agent.',
    nextActionResponsible: 'John Mercer',
    nextActionDueDate: '2026-07-06',
    nextActionReminder: 'Email agent for ETA confirmation of the engineer.',
    agent: 'Wallem Shipping Singapore',
    vendor: 'Erma First Service Team',
    surveyor: 'N/A',
    authority: 'DNV / USCG Compliance',
    eta: '2026-07-09T08:00',
    etb: '2026-07-09T14:00',
    ets: '2026-07-11T18:00',
    attachments: 'Sensor_Calibration_Manual_v2.pdf, ErmaFirst_Quote_SGP_1092.pdf',
    notes: 'Vessel needs to depart SGP with fully functional BWTS to avoid USCG hold-ups.',
    emails: [
      {
        id: 'em-1',
        ref: '1a',
        direction: 'Outgoing',
        sender: 'john.mercer@technical-dept.com',
        recipient: 'service@ermafirst.com',
        subject: 'Service Request: M/V STEFANOS - BWTS Calibration at Singapore',
        date: '2026-07-02T09:15:00Z',
        summary: 'Formally requested Erma First service engineers to attend the vessel on arrival (ETA 9th July) to calibrate the DP sensors and flow meter.',
        content: 'Dear Service Team,\n\nPlease find attached our official service request for M/V STEFANOS arriving in Singapore on 9th July. We require calibration of the differential pressure sensors on the filter unit and a comprehensive health check of the flow meter.\n\nKindly confirm availability and send your official quotation.\n\nBest Regards,\nJohn Mercer\nTechnical Superintendent',
        attachments: 'Official_Service_Request_STEFANOS.pdf',
        followUpRequired: true,
        isImportant: true,
      },
      {
        id: 'em-2',
        ref: '1b',
        direction: 'Incoming',
        sender: 'service@ermafirst.com',
        recipient: 'john.mercer@technical-dept.com',
        subject: 'Re: Service Request: M/V STEFANOS - BWTS Calibration at Singapore',
        date: '2026-07-03T11:40:00Z',
        summary: 'Erma First confirmed availability of senior engineer Mr. Lin for 9th July and attached the quotation.',
        content: 'Dear Mr. Mercer,\n\nThank you for your email. We have confirmed the availability of our senior service engineer, Mr. Lin, to attend the vessel on 9th July at Singapore anchorage.\n\nPlease find attached our formal quotation SGP-1092. Please return the signed work order to secure this slot.\n\nWith best regards,\nElena Rostova\nErma First Coordinator',
        attachments: 'ErmaFirst_Quote_SGP_1092.pdf',
        followUpRequired: false,
      },
      {
        id: 'em-3',
        ref: '2a',
        direction: 'Outgoing',
        sender: 'john.mercer@technical-dept.com',
        recipient: 'singapore.agent@wallem.com',
        subject: 'M/V STEFANOS - BWTS Erma First Service Attendance Coordination',
        date: '2026-07-04T15:30:00Z',
        summary: 'Sent signed work order and requested agent to coordinate boarding clearance and launch boat for Mr. Lin on 9th July.',
        content: 'Dear Agent,\n\nWe have booked Erma First service engineer Mr. Lin to board M/V STEFANOS on 9th July. He will require anchorage boarding clearance and launch boat coordination.\n\nI am attaching the engineer passport copy and our signed work order. Please coordinate with the Captain and Erma First directly.\n\nBest Regards,\nJohn Mercer',
        attachments: 'Signed_Work_Order.pdf, Engineer_Passport_Lin.pdf',
        followUpRequired: true,
      }
    ],
    comments: [
      {
        id: 'co-1',
        author: 'John Mercer',
        date: '2026-07-01T10:15:00Z',
        content: 'Logged this case after speaking with Chief Engineer. He reports intermittent DP sensor errors. We cannot take chances before entering US waters next month.'
      },
      {
        id: 'co-2',
        author: 'Captain (via email)',
        date: '2026-07-03T04:22:00Z',
        content: 'Confirming we have prepared the BWTS area for the service engineer. All manuals and spares have been brought out.'
      }
    ]
  },
  {
    id: 'CASE-2026-002',
    vesselId: 'v-2', // M/V IRINA
    portId: 'p-1', // Singapore
    jobType: 'BWTS sampling',
    subject: 'M/V IRINA - BWTS Biological Efficacy Sampling',
    responsiblePerson: 'Sarah Jenkins (Marine Manager)',
    status: 'In Progress',
    priority: 'Medium',
    createdDate: '2026-07-02T14:20:00Z',
    lastUpdatedDate: '2026-07-04T09:00:00Z',
    deadline: '2026-07-12',
    details: 'Vessel is due for mandatory annual biological efficacy sampling of ballast water discharge to verify compliance with IMO D-2 standards. Sampling must be conducted by an independent laboratory during the upcoming Singapore cargo port call.',
    nextAction: 'Ensure lab technicians receive the port terminal access clearance.',
    nextActionResponsible: 'Sarah Jenkins',
    nextActionDueDate: '2026-07-08',
    nextActionReminder: 'Verify terminal entry rules for third-party lab.',
    agent: 'Inlet Agency SGP',
    vendor: 'SGS Marine Services SGP',
    surveyor: 'N/A',
    authority: 'IMO D-2 / MPA Singapore',
    eta: '2026-07-11T04:00',
    etb: '2026-07-11T12:00',
    ets: '2026-07-13T10:00',
    attachments: 'SGS_Sampling_Agreement_SGP.pdf',
    notes: 'Sampling needs to be taken during discharge operations. Crew must be fully instructed.',
    emails: [
      {
        id: 'em-4',
        ref: '1a',
        direction: 'Outgoing',
        sender: 'sarah.jenkins@technical-dept.com',
        recipient: 'sgs.sgp@sgs.com',
        subject: 'Request for Ballast Water Discharge Sampling - M/V IRINA',
        date: '2026-07-03T08:00:00Z',
        summary: 'Requested SGS Singapore to perform discharge sampling on 11th July during discharge operations.',
        content: 'Dear SGS Marine Team,\n\nWe request ballast water sampling for M/V IRINA. She is expected to discharge ballast in Singapore on 11th July.\n\nPlease let us know if you can attend and what the sampling kit delivery requirements are.\n\nBest Regards,\nSarah Jenkins',
        followUpRequired: true,
      },
      {
        id: 'em-5',
        ref: '1b',
        direction: 'Incoming',
        sender: 'sgs.sgp@sgs.com',
        recipient: 'sarah.jenkins@technical-dept.com',
        subject: 'Re: Request for Ballast Water Discharge Sampling - M/V IRINA',
        date: '2026-07-04T09:00:00Z',
        summary: 'SGS accepted the booking and detailed the sampling protocols. Crew must not treat water with chlorine 24h prior.',
        content: 'Dear Ms. Jenkins,\n\nWe accept the booking for biological sampling. Our team will attend on 11th July at the container terminal. Please ensure the vessel crew is advised NOT to perform any chemical treatment or manual neutralization 24 hours prior to sampling to avoid corrupting results.\n\nWe will coordinate port access with Inlet Agency.\n\nWarm regards,\nDave Tan\nSGS SGP Operations',
        followUpRequired: false,
      }
    ],
    comments: []
  },
  {
    id: 'CASE-2026-003',
    vesselId: 'v-3', // M/V DANAE
    portId: 'p-2', // Santos
    jobType: 'Class survey',
    subject: 'M/V DANAE - Intermediate Class Survey & Boiler Examination',
    responsiblePerson: 'Marcus Vance (Technical Director)',
    status: 'In Worklist',
    priority: 'High',
    createdDate: '2026-07-03T11:00:00Z',
    lastUpdatedDate: '2026-07-05T07:15:00Z',
    deadline: '2026-07-25',
    details: 'Vessel is due for Intermediate Class Survey with Bureau Veritas (BV). Specifically, the auxiliary boiler internal examination and pressure test must be completed, as the previous extension expires on July 30th. Dry docking is not required but boiler must be cooled down prior.',
    nextAction: 'Confirm boiler preparation timetable with Chief Engineer.',
    nextActionResponsible: 'Marcus Vance',
    nextActionDueDate: '2026-07-10',
    nextActionReminder: 'Remind crew about boiler blow-down and venting procedures 48h before arrival.',
    agent: 'Santos Oceanica Agency',
    vendor: 'N/A',
    surveyor: 'BV Santos Surveyor',
    authority: 'Bureau Veritas (BV)',
    eta: '2026-07-20T16:00',
    etb: '2026-07-21T07:00',
    ets: '2026-07-24T22:00',
    attachments: 'BV_Intermediate_Survey_Items.pdf',
    notes: 'Crew must ensure boiler is clean and dry. Oxygen content must be checked before surveyor entry.',
    emails: [],
    comments: [
      {
        id: 'co-3',
        author: 'Marcus Vance',
        date: '2026-07-04T16:00:00Z',
        content: 'Created BV Class request portal entry. Bureau Veritas confirmed receipt of request.'
      }
    ]
  },
  {
    id: 'CASE-2026-004',
    vesselId: 'v-4', // M/V ALLIANCE
    portId: 'p-3', // Tuticorin
    jobType: 'VDR / GMDSS service',
    subject: 'M/V ALLIANCE - Annual Performance Test (APT) of Furuno VDR',
    responsiblePerson: 'John Mercer (Technical Supt)',
    status: 'Finished',
    priority: 'Medium',
    createdDate: '2026-06-15T09:00:00Z',
    lastUpdatedDate: '2026-06-22T14:00:00Z',
    deadline: '2026-06-25',
    details: 'Mandatory annual performance test (APT) for Furuno VR-7000 Voyage Data Recorder (VDR). Must be performed by an approved Furuno service technician with COC certificates. Certificate expires end of June.',
    nextAction: 'Distribute signed APT certificate to vessel and file in Class folder.',
    nextActionResponsible: 'John Mercer',
    nextActionDueDate: '2026-06-23',
    nextActionReminder: 'Upload electronic copy of certificate to cloud database.',
    agent: 'SeaPort Agencies Tuticorin',
    vendor: 'Radiolink Marine Electronics',
    surveyor: 'N/A',
    authority: 'ClassNK / Flag State',
    eta: '2026-06-20T10:00',
    etb: '2026-06-20T18:00',
    ets: '2026-06-22T20:00',
    attachments: 'Furuno_APT_Report_ALLIANCE_2026.pdf, CoC_Certificate_Radiolink.pdf',
    notes: 'Completed successfully. No defects reported. All channels and microphones verified active.',
    emails: [
      {
        id: 'em-6',
        ref: '1a',
        direction: 'Outgoing',
        sender: 'john.mercer@technical-dept.com',
        recipient: 'ops@radiolink-marine.com',
        subject: 'Furuno VDR APT booking - M/V ALLIANCE at Tuticorin',
        date: '2026-06-16T10:00:00Z',
        summary: 'Booked VDR APT service for 20th June.',
        content: 'Dear Radiolink,\n\nPlease confirm if your service engineer can attend M/V ALLIANCE on 20th June for the VDR APT check.\n\nKindly send quotes and confirm Furuno approval.',
        followUpRequired: false,
      },
      {
        id: 'em-7',
        ref: '1b',
        direction: 'Incoming',
        sender: 'ops@radiolink-marine.com',
        recipient: 'john.mercer@technical-dept.com',
        subject: 'Re: Furuno VDR APT booking - M/V ALLIANCE at Tuticorin',
        date: '2026-06-17T08:30:00Z',
        summary: 'Radiolink confirmed attendance and technician Mr. Sharma.',
        content: 'Dear Sir,\n\nWe confirm attendance of our Furuno engineer Mr. Sharma on 20th June. Quoted cost is USD 1,200 inclusive of travel.\n\nBest regards,\nRajesh Kumar\nRadiolink Ops',
        followUpRequired: false,
      },
      {
        id: 'em-8',
        ref: '2b',
        direction: 'Incoming',
        sender: 'ops@radiolink-marine.com',
        recipient: 'john.mercer@technical-dept.com',
        subject: 'M/V ALLIANCE VDR APT Completed - Certificate Attached',
        date: '2026-06-21T18:15:00Z',
        summary: 'Radiolink sent the signed APT certificate showing a PASS status.',
        content: 'Dear Mr. Mercer,\n\nWe are pleased to inform you that the VDR APT for M/V ALLIANCE has been successfully completed today. No anomalies detected.\n\nPlease find the PDF certificate attached.\n\nBest regards,\nRajesh Kumar',
        attachments: 'Furuno_APT_Report_ALLIANCE_2026.pdf',
        followUpRequired: false,
      }
    ],
    comments: [
      {
        id: 'co-4',
        author: 'John Mercer',
        date: '2026-06-22T14:00:00Z',
        content: 'APT document received, reviewed and verified clean. Closing case.'
      }
    ]
  },
  {
    id: 'CASE-2026-005',
    vesselId: 'v-2', // M/V IRINA
    portId: 'p-4', // Rotterdam
    jobType: 'Liferaft service',
    subject: 'M/V IRINA - Annual Liferaft Servicing & Hydrostatic Release Replacement',
    responsiblePerson: 'Sarah Jenkins (Marine Manager)',
    status: 'Postponed but Reopened',
    priority: 'High',
    createdDate: '2026-05-10T08:00:00Z',
    lastUpdatedDate: '2026-07-04T11:00:00Z',
    deadline: '2026-07-18',
    details: 'The 4x port and starboard liferafts require mandatory annual servicing. Originally scheduled in Hamburg, the call was cancelled. The case was postponed but is now reopened as the vessel is bound for Rotterdam. Land-to-ship replacement/swapping service is required to minimize port stay disruption.',
    nextAction: 'Finalize liferaft swap arrangements with Survitec Rotterdam.',
    nextActionResponsible: 'Sarah Jenkins',
    nextActionDueDate: '2026-07-07',
    nextActionReminder: 'Ensure agent coordinates transport from quay to Survitec facility.',
    agent: 'Royal Dirkzwager Rotterdam',
    vendor: 'Survitec Group Rotterdam',
    surveyor: 'N/A',
    authority: 'Solas III / Lloyd\'s Register',
    eta: '2026-07-17T06:00',
    etb: '2026-07-17T15:00',
    ets: '2026-07-19T18:00',
    attachments: 'Liferaft_Certificates_Stale.pdf',
    notes: 'Crucial safety equipment. Swap method must be used because normal servicing takes 24-48 hours, which exceeds ETB slot.',
    emails: [
      {
        id: 'em-9',
        ref: '1a',
        direction: 'Outgoing',
        sender: 'sarah.jenkins@technical-dept.com',
        recipient: 'rotterdam.service@survitecgroup.com',
        subject: 'Liferaft Swap Booking: M/V IRINA - Rotterdam 17th July',
        date: '2026-07-04T10:00:00Z',
        summary: 'Inquired about liferaft swap availability in Rotterdam due to Hamburg bypass.',
        content: 'Dear Survitec,\n\nOur vessel M/V IRINA will call Rotterdam on 17th July instead of Hamburg. We need to swap our 4x Viking 25-person liferafts with certified serviced units upon arrival to avoid delays.\n\nPlease confirm if you have swap units in stock and provide a quotation.\n\nBest Regards,\nSarah Jenkins',
        followUpRequired: true,
        isImportant: true,
      },
      {
        id: 'em-10',
        ref: '1b',
        direction: 'Incoming',
        sender: 'rotterdam.service@survitecgroup.com',
        recipient: 'sarah.jenkins@technical-dept.com',
        subject: 'Re: Liferaft Swap Booking: M/V IRINA - Rotterdam 17th July',
        date: '2026-07-04T11:00:00Z',
        summary: 'Survitec confirmed swap units are available and requested serial numbers to check cradle compatibility.',
        content: 'Dear Ms. Jenkins,\n\nYes, we can support a liferaft swap for M/V IRINA on 17th July at Rotterdam. We have fully serviced Viking 25-DK units in stock.\n\nPlease provide the serial numbers and cradle dimensions of your current liferafts to confirm physical compatibility.\n\nBest Regards,\nDirk de Groot\nSurvitec Rotterdam Operations',
        followUpRequired: false,
      }
    ],
    comments: [
      {
        id: 'co-5',
        author: 'Sarah Jenkins',
        date: '2026-07-04T09:30:00Z',
        content: 'Reopening this case after charterers shifted the port call from Hamburg to Rotterdam. Liferafts are now overdue.'
      }
    ]
  },
  {
    id: 'CASE-2026-006',
    vesselId: 'v-1',
    portId: 'p-5', // Houston
    jobType: 'Port State Control follow-up',
    subject: 'M/V STEFANOS - USCG PSC Deficiency Rectification (Emergency Generator)',
    responsiblePerson: 'John Mercer (Technical Supt)',
    status: 'Postponed',
    priority: 'High',
    createdDate: '2026-05-12T14:00:00Z',
    lastUpdatedDate: '2026-06-10T12:00:00Z',
    deadline: '2026-08-15',
    details: 'During previous USCG inspection, a recommendation was issued regarding minor exhaust leakage on the emergency generator turbocharger casing. Flag state has allowed temporary patch repair until the vessel calls Houston in August, where a new replacement casing must be installed and tested.',
    nextAction: 'Confirm delivery of replacement turbocharger casing to Houston warehouse.',
    nextActionResponsible: 'John Mercer',
    nextActionDueDate: '2026-07-20',
    nextActionReminder: 'Check with parts forwarding agent in Houston.',
    agent: 'Gulf Coast Shipping Houston',
    vendor: 'MAN Energy Solutions Houston',
    surveyor: 'USCG Inspector / ABS Surveyor',
    authority: 'USCG / ABS',
    eta: '2026-08-12T12:00',
    etb: '2026-08-13T06:00',
    ets: '2026-08-16T18:00',
    attachments: 'USCG_Deficiency_Form_372.pdf',
    notes: 'Case is postponed while the ship is in transit in the Atlantic, but parts procurement is active.',
    emails: [],
    comments: [
      {
        id: 'co-6',
        author: 'John Mercer',
        date: '2026-06-10T11:45:00Z',
        content: 'Temporary exhaust bandage patch is holding fine. Chief Engineer inspects it daily. Case is in postponed status until vessel nears US Gulf.'
      }
    ]
  },
  {
    id: 'CASE-2026-007',
    vesselId: 'v-5', // M/V ODYSSEUS
    portId: 'p-1', // Singapore
    jobType: 'LSA/FFE inspection',
    subject: 'M/V ODYSSEUS - Annual CO2 High Pressure System Inspection',
    responsiblePerson: 'Sarah Jenkins (Marine Manager)',
    status: 'Awaiting Reply',
    priority: 'High',
    createdDate: '2026-07-04T08:00:00Z',
    lastUpdatedDate: '2026-07-05T04:12:00Z',
    deadline: '2026-07-15',
    details: 'Annual weighing and level check of high-pressure CO2 bottles in the main engine room battery room. Also involves hydrostatic testing of 10% of the cylinders that are older than 10 years.',
    nextAction: 'Await quote from local Singapore approved FFE service supplier.',
    nextActionResponsible: 'Sarah Jenkins',
    nextActionDueDate: '2026-07-07',
    nextActionReminder: 'Follow up with SGP FFE suppliers if quote not received by Monday.',
    agent: 'Pacific Marine Agency',
    vendor: 'SuperFire Marine SGP',
    surveyor: 'N/A',
    authority: 'ABS / Solas II-2',
    eta: '2026-07-13T08:00',
    etb: '2026-07-13T18:00',
    ets: '2026-07-15T22:00',
    attachments: 'CO2_Inventory_Odysseus.pdf',
    notes: 'Coordinating simultaneous testing during bunkering operation to save time.',
    emails: [
      {
        id: 'em-11',
        ref: '1a',
        direction: 'Outgoing',
        sender: 'sarah.jenkins@technical-dept.com',
        recipient: 'quotes@superfire.com.sg',
        subject: 'RFQ: Annual CO2 System Servicing - M/V ODYSSEUS at SGP',
        date: '2026-07-04T09:00:00Z',
        summary: 'Requested comprehensive quote for high pressure CO2 weighing and bottle hydrostatic testing.',
        content: 'Dear SuperFire Team,\n\nWe require annual inspection and weighing of 84 high-pressure CO2 bottles for M/V ODYSSEUS arriving SGP on 13th July. Additionally, 8 bottles require hydrostatic testing (10-year rule).\n\nPlease send us your best quotation.\n\nWarm regards,\nSarah Jenkins',
        followUpRequired: true,
      }
    ],
    comments: []
  }
];
