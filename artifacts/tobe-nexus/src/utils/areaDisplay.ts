const LAND_ONLY_TYPES = ['土地 / 農地', '建地 / 工業地'];
const BOTH_TYPES = ['透天厝 (住宅)', '透天厝 (店住)', '別墅 / 莊園'];

export function getAreaDisplay(
  propertyType: string,
  buildPing: number,
  landPing: number,
): string {
  if (LAND_ONLY_TYPES.includes(propertyType)) {
    return landPing > 0 ? `地坪 ${landPing} 坪` : '地坪未填';
  }
  if (BOTH_TYPES.includes(propertyType)) {
    const parts: string[] = [];
    if (landPing > 0) parts.push(`地坪 ${landPing}`);
    if (buildPing > 0) parts.push(`建坪 ${buildPing}`);
    if (parts.length === 0) return '坪數未填';
    return parts.join(' / ') + ' 坪';
  }
  return buildPing > 0 ? `建坪 ${buildPing} 坪` : '坪數未填';
}

export function getAreaDisplayCompact(
  propertyType: string,
  buildPing: number,
  landPing: number,
): string {
  if (LAND_ONLY_TYPES.includes(propertyType)) {
    return landPing > 0 ? `地坪 ${landPing} 坪` : '地坪未填';
  }
  if (BOTH_TYPES.includes(propertyType)) {
    const parts: string[] = [];
    if (landPing > 0) parts.push(`地${landPing}`);
    if (buildPing > 0) parts.push(`建${buildPing}`);
    if (parts.length === 0) return '坪數未填';
    return parts.join('/') + ' 坪';
  }
  return buildPing > 0 ? `${buildPing} 坪` : '坪數未填';
}
