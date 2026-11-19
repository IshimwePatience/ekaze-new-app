const express = require('express');
const router = express.Router();
const rwandaGeo = require('rwanda-geo');

const PROVINCES = [
  { id: 1, name: 'Kigali City', code: 'RW-01' },
  { id: 2, name: 'Southern Province', code: 'RW-02' },
  { id: 3, name: 'Western Province', code: 'RW-03' },
  { id: 4, name: 'Northern Province', code: 'RW-04' },
  { id: 5, name: 'Eastern Province', code: 'RW-05' }
];

let nextId = 100;
const codeToId = new Map();
const idToItem = new Map();

const provinceByName = new Map();
const districtByName = new Map();
const sectorByName = new Map();

// Initialize Provinces in maps
PROVINCES.forEach(p => {
  codeToId.set(p.code, p.id);
  idToItem.set(p.id, { id: p.id, code: p.code, name: p.name, type: 'province' });
  provinceByName.set(p.name.toLowerCase().trim(), p);
  provinceByName.set(p.code.toLowerCase().trim(), p);
  if (p.name.includes('Kigali')) provinceByName.set('kigali', p);
});

// Pre-index Districts and Sectors so IDs are stable and lookups are instantaneous
const allDistricts = rwandaGeo.getAllDistricts();
allDistricts.forEach(d => {
  const pCode = d.parentCode;
  const pId = codeToId.get(pCode) || 1;
  const dId = nextId++;
  codeToId.set(d.code, dId);
  idToItem.set(dId, { id: dId, code: d.code, name: d.name, type: 'district', parent_id: pId });
  districtByName.set(d.name.toLowerCase().trim(), d);
  districtByName.set(d.code.toLowerCase().trim(), d);
});

const allSectors = rwandaGeo.getAllSectors();
allSectors.forEach(s => {
  const dCode = s.parentCode;
  const dId = codeToId.get(dCode) || 100;
  const sId = nextId++;
  codeToId.set(s.code, sId);
  idToItem.set(sId, { id: sId, code: s.code, name: s.name, type: 'sector', parent_id: dId });
  
  const secKey = s.name.toLowerCase().trim();
  if (!sectorByName.has(secKey)) sectorByName.set(secKey, []);
  sectorByName.get(secKey).push(s);
});

// Helper to get or register cell/village IDs dynamically with stability
const getEntityId = (entity, type, parentId) => {
  if (codeToId.has(entity.code)) return codeToId.get(entity.code);
  const id = nextId++;
  codeToId.set(entity.code, id);
  idToItem.set(id, { id, code: entity.code, name: entity.name, type, parent_id: parentId });
  return id;
};

// GET /locations/provinces
router.get('/provinces', (req, res) => {
  return res.status(200).json({
    success: true,
    data: PROVINCES
  });
});

// GET /locations/districts?province_id=X or ?province=Kigali City
router.get('/districts', (req, res) => {
  const pParam = req.query.province_id || req.query.province || req.query.province_name;
  let targetProvinceCode = null;

  if (pParam) {
    const parsed = parseInt(pParam, 10);
    if (!isNaN(parsed) && idToItem.has(parsed)) {
      const pItem = idToItem.get(parsed);
      if (pItem) targetProvinceCode = pItem.code;
    } else {
      const p = provinceByName.get(String(pParam).toLowerCase().trim());
      if (p) targetProvinceCode = p.code;
    }
  }

  let districtsList = [];
  if (targetProvinceCode) {
    districtsList = rwandaGeo.getDistrictsByProvince(targetProvinceCode) || [];
  } else if (!pParam) {
    districtsList = allDistricts;
  } else {
    districtsList = [];
  }

  const mapped = districtsList.map(d => {
    const pCode = d.parentCode;
    const pId = codeToId.get(pCode) || 1;
    const dId = codeToId.get(d.code) || 100;
    return {
      id: dId,
      province_id: pId,
      name: d.name,
      code: d.code
    };
  });

  return res.status(200).json({
    success: true,
    data: mapped
  });
});

// GET /locations/sectors?district_id=X or ?district=Gasabo
router.get('/sectors', (req, res) => {
  const dParam = req.query.district_id || req.query.district || req.query.district_name;
  let targetDistrictCode = null;

  if (dParam) {
    const parsed = parseInt(dParam, 10);
    if (!isNaN(parsed) && idToItem.has(parsed)) {
      const distItem = idToItem.get(parsed);
      if (distItem) targetDistrictCode = distItem.code;
    } else {
      const d = districtByName.get(String(dParam).toLowerCase().trim());
      if (d) targetDistrictCode = d.code;
    }
  }

  let sectorsList = [];
  if (targetDistrictCode) {
    sectorsList = rwandaGeo.getSectorsByDistrict(targetDistrictCode) || [];
  } else if (!dParam) {
    sectorsList = allSectors;
  } else {
    sectorsList = [];
  }

  const mapped = sectorsList.map(s => {
    const dId = codeToId.get(s.parentCode) || 100;
    const sId = codeToId.get(s.code) || getEntityId(s, 'sector', dId);
    return {
      id: sId,
      district_id: dId,
      name: s.name,
      code: s.code
    };
  });

  return res.status(200).json({
    success: true,
    data: mapped
  });
});

// GET /locations/cells?sector_id=X or ?sector=Kimironko
router.get('/cells', (req, res) => {
  const sParam = req.query.sector_id || req.query.sector || req.query.sector_name;
  const dParam = req.query.district_id || req.query.district || req.query.district_name;
  let targetSectorCode = null;

  if (sParam) {
    const parsed = parseInt(sParam, 10);
    if (!isNaN(parsed) && idToItem.has(parsed)) {
      const secItem = idToItem.get(parsed);
      if (secItem) targetSectorCode = secItem.code;
    } else {
      const cleanName = String(sParam).toLowerCase().trim();
      const list = sectorByName.get(cleanName) || [];
      if (list.length === 1) {
        targetSectorCode = list[0].code;
      } else if (list.length > 1 && dParam) {
        let distCode = null;
        const parsedD = parseInt(dParam, 10);
        if (!isNaN(parsedD) && idToItem.has(parsedD)) {
          distCode = idToItem.get(parsedD)?.code;
        } else {
          distCode = districtByName.get(String(dParam).toLowerCase().trim())?.code;
        }
        const matched = list.find(s => s.parentCode === distCode);
        targetSectorCode = matched ? matched.code : list[0].code;
      } else if (list.length > 0) {
        targetSectorCode = list[0].code;
      }
    }
  }

  let cellsList = [];
  if (targetSectorCode) {
    cellsList = rwandaGeo.getCellsBySector(targetSectorCode) || [];
  } else {
    cellsList = [];
  }

  const mapped = cellsList.map(c => {
    const sId = codeToId.get(c.parentCode) || 100;
    const cId = getEntityId(c, 'cell', sId);
    return {
      id: cId,
      sector_id: sId,
      name: c.name,
      code: c.code
    };
  });

  return res.status(200).json({
    success: true,
    data: mapped
  });
});

// GET /locations/villages?cell_id=X or ?cell=Bibare
router.get('/villages', (req, res) => {
  const cParam = req.query.cell_id || req.query.cell || req.query.cell_name;
  const sParam = req.query.sector_id || req.query.sector || req.query.sector_name;
  let targetCellCode = null;

  if (cParam) {
    const parsed = parseInt(cParam, 10);
    if (!isNaN(parsed) && idToItem.has(parsed)) {
      const cellItem = idToItem.get(parsed);
      if (cellItem) targetCellCode = cellItem.code;
    } else {
      const cleanName = String(cParam).toLowerCase().trim();
      let parentSecCode = null;
      if (sParam) {
        const parsedS = parseInt(sParam, 10);
        if (!isNaN(parsedS) && idToItem.has(parsedS)) {
          parentSecCode = idToItem.get(parsedS)?.code;
        } else {
          const list = sectorByName.get(String(sParam).toLowerCase().trim()) || [];
          if (list.length > 0) parentSecCode = list[0].code;
        }
      }
      if (parentSecCode) {
        const secCells = rwandaGeo.getCellsBySector(parentSecCode) || [];
        const match = secCells.find(c => c.name.toLowerCase().trim() === cleanName);
        if (match) targetCellCode = match.code;
      }
      if (!targetCellCode) {
        const found = rwandaGeo.searchByName(cleanName);
        const cellMatch = Array.isArray(found) ? found.find(item => item.code && item.code.startsWith('RW-C-')) : null;
        if (cellMatch) targetCellCode = cellMatch.code;
      }
    }
  }

  let villagesList = [];
  if (targetCellCode) {
    villagesList = rwandaGeo.getVillagesByCell(targetCellCode) || [];
  } else {
    villagesList = [];
  }

  const mapped = villagesList.map(v => {
    const cId = codeToId.get(v.parentCode) || 100;
    const vId = getEntityId(v, 'village', cId);
    return {
      id: vId,
      cell_id: cId,
      name: v.name,
      code: v.code
    };
  });

  return res.status(200).json({
    success: true,
    data: mapped
  });
});

// GET /locations/hierarchy
router.get('/hierarchy', (req, res) => {
  const provinces = PROVINCES.map(p => {
    const dists = rwandaGeo.getDistrictsByProvince(p.code);
    return {
      ...p,
      districts: dists.map(d => ({
        id: codeToId.get(d.code),
        name: d.name,
        code: d.code
      }))
    };
  });

  return res.status(200).json({
    success: true,
    data: provinces
  });
});

module.exports = router;
