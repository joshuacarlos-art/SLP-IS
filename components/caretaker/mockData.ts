import { Caretaker } from './types';

export const mockCaretakers: Caretaker[] = [
  {
    id: 'CT001',
    firstName: 'Maria',
    lastName: 'Santos',
    middleName: 'Reyes',
    participantType: 'Association Member',
    sex: 'Female',
    contactNumber: '+63 912 345 6789',
    slpAssociation: 'Binalbagan Farmers Association',
    houseLotNo: '123',
    street: 'Rizal Street',
    barangay: 'Poblacion',
    cityMunicipality: 'Binalbagan',
    province: 'Negros Occidental',
    region: 'Region VI - Western Visayas',
    slpaName: 'Juan Dela Cruz',
    slpaDesignation: 'President',
    modality: 'Livelihood Assistance',
    dateProvided: '2024-01-15',
    status: 'active'
  },
  {
    id: 'CT002',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    extension: 'Jr.',
    participantType: 'Individual',
    sex: 'Male',
    contactNumber: '+63 917 890 1234',
    slpAssociation: 'Himamaylan Livelihood Cooperative',
    barangay: 'Brgy. Caradio-an',
    cityMunicipality: 'Himamaylan',
    province: 'Negros Occidental',
    region: 'Region VI - Western Visayas',
    modality: 'Skills Training',
    dateProvided: '2024-02-01',
    status: 'active'
  }
];

export const emptyCaretaker: Caretaker = {
  firstName: '',
  lastName: '',
  participantType: '',
  sex: '',
  slpAssociation: '',
  barangay: '',
  cityMunicipality: '',
  province: '',
  region: '',
  modality: '',
  dateProvided: '',
  status: 'active'
};