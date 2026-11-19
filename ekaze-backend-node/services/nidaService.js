/**
 * NIDA Identity Service (Mock NIDA Engine)
 * Pre-fills citizen identity details (NID, Name, DOB, Address)
 */

// Mock NIDA Citizen Database (6 Test Records for Development & Verification)
const MOCK_NIDA_DATABASE = {
  '1199880012345678': {
    national_id: '1199880012345678',
    name: 'Mugisha Eric',
    first_name: 'Eric',
    last_name: 'Mugisha',
    gender: 'male',
    date_of_birth: '1998-05-12',
    province: 'Kigali City',
    district: 'Nyarugenge',
    sector: 'Nyamirambo',
    cell: 'Rwezamenyo',
    village: 'Akabahizi',
    is_verified: true
  },
  '1199590087654321': {
    national_id: '1199590087654321',
    name: 'Uwase Marie Grace',
    first_name: 'Marie Grace',
    last_name: 'Uwase',
    gender: 'female',
    date_of_birth: '1995-11-20',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Remera',
    cell: 'Rukiri II',
    village: 'Nyabisindu',
    is_verified: true
  },
  '1199280011223344': {
    national_id: '1199280011223344',
    name: 'Habimana Jean Paul',
    first_name: 'Jean Paul',
    last_name: 'Habimana',
    gender: 'male',
    date_of_birth: '1992-03-15',
    province: 'Kigali City',
    district: 'Kicukiro',
    sector: 'Gikondo',
    cell: 'Kanserege',
    village: 'Mulindi',
    is_verified: true
  },
  '1199590055667788': {
    national_id: '1199590055667788',
    name: 'Ingabire Diane',
    first_name: 'Diane',
    last_name: 'Ingabire',
    gender: 'female',
    date_of_birth: '1997-09-08',
    province: 'Southern Province',
    district: 'Huye',
    sector: 'Ngoma',
    cell: 'Matyazo',
    village: 'Kabutare',
    is_verified: true
  },
  '1199080099887766': {
    national_id: '1199080099887766',
    name: 'Niyonzima Patrick',
    first_name: 'Patrick',
    last_name: 'Niyonzima',
    gender: 'male',
    date_of_birth: '1990-01-25',
    province: 'Western Province',
    district: 'Rubavu',
    sector: 'Gisenyi',
    cell: 'Nyamirambo',
    village: 'Amahoro',
    is_verified: true
  },
  '1199000012345678': {
    national_id: '1199000012345678',
    name: 'Iradukunda Chantal',
    first_name: 'Chantal',
    last_name: 'Iradukunda',
    gender: 'female',
    date_of_birth: '1996-07-04',
    province: 'Northern Province',
    district: 'Musanze',
    sector: 'Muhoza',
    cell: 'Cyivugiza',
    village: 'Ruhengeri',
    is_verified: true
  }
};

const verifyNationalId = async (nationalId) => {
  if (!nationalId || nationalId.length !== 16) {
    throw new Error('National ID must be exactly 16 digits.');
  }

  // Check if NID exists in our mock database
  if (MOCK_NIDA_DATABASE[nationalId]) {
    return {
      success: true,
      ...MOCK_NIDA_DATABASE[nationalId]
    };
  }

  // Fallback for any other 16-digit NID
  const isMale = parseInt(nationalId.charAt(5), 10) % 2 === 1;
  
  return {
    success: true,
    national_id: nationalId,
    name: 'Citizen ' + nationalId.substring(12),
    first_name: 'Citizen',
    last_name: nationalId.substring(12),
    gender: isMale ? 'male' : 'female',
    date_of_birth: '1995-05-15',
    province: 'Kigali City',
    district: 'Nyarugenge',
    sector: 'Nyamirambo',
    cell: 'Rwezamenyo',
    village: 'Akabahizi',
    is_verified: true
  };
};

module.exports = { verifyNationalId, MOCK_NIDA_DATABASE };

