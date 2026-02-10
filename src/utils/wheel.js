const COLOR_PALETTE = [
  '#F94144',
  '#F3722C',
  '#F8961E',
  '#F9C74F',
  '#90BE6D',
  '#43AA8B',
  '#4D908E',
  '#577590',
  '#277DA1',
  '#9B5DE5',
  '#F15BB5',
  '#00BBF9',
];

const sanitizeWeight = (weight) => {
  const parsed = parseFloat(weight);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
};

export const buildSegments = (options = []) => {
  if (!options.length) {
    return [];
  }

  const sanitized = options.map((option, index) => ({
    ...option,
    color: option.color ?? COLOR_PALETTE[index % COLOR_PALETTE.length],
    weight: sanitizeWeight(option.weight ?? 1),
  }));

  const totalWeight = sanitized.reduce((sum, option) => sum + option.weight, 0);
  const fallbackSweep = 360 / sanitized.length;
  let cursor = 0;

  return sanitized.map((option) => {
    const normalizedWeight = totalWeight > 0 ? option.weight / totalWeight : 1 / sanitized.length;
    const sweepAngle = normalizedWeight * 360 || fallbackSweep;
    const segment = {
      ...option,
      startAngle: cursor,
      sweepAngle,
      midAngle: cursor + sweepAngle / 2,
    };
    cursor += sweepAngle;
    return segment;
  });
};

export const chooseWeightedSegment = (segments = []) => {
  if (!segments.length) {
    return null;
  }

  const totalWeight = segments.reduce((sum, segment) => sum + (segment.weight || 0), 0);
  const effectiveTotal = totalWeight > 0 ? totalWeight : segments.length;
  const ticket = Math.random() * effectiveTotal;
  let accumulator = 0;

  for (const segment of segments) {
    const currentWeight = segment.weight || (effectiveTotal / segments.length);
    accumulator += currentWeight;
    if (ticket <= accumulator) {
      const overshoot = accumulator - ticket;
      const ratioInside = 1 - overshoot / currentWeight;
      const landingAngle = segment.startAngle + ratioInside * segment.sweepAngle;
      return {
        segment,
        landingAngle,
      };
    }
  }

  const lastSegment = segments[segments.length - 1];
  return {
    segment: lastSegment,
    landingAngle: lastSegment.startAngle + lastSegment.sweepAngle / 2,
  };
};

