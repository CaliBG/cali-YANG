/** Beijing calendar days, independent of the visitor's timezone and DST. */
export function invitationCodes(now = new Date()): [string, string] {
  const beijing = now.getTime() + 8 * 60 * 60 * 1000;
  const code = (time: number) => {
    const date = new Date(time);
    return `${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
  };
  return [code(beijing), code(beijing - 24 * 60 * 60 * 1000)];
}

export function validInvitation(value: string, now = new Date()): boolean {
  return /^\d{4}$/.test(value) && invitationCodes(now).includes(value);
}
