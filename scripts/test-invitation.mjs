import assert from 'node:assert/strict';
import { invitationCodes, validInvitation } from '../site/lib/invitation.ts';
const cases = [
  ['2026-11-26T15:59:59Z', ['1126', '1125']],
  ['2026-11-26T16:00:00Z', ['1127', '1126']],
  ['2026-11-27T15:59:59Z', ['1127', '1126']],
  ['2026-11-27T16:00:00Z', ['1128', '1127']],
  ['2026-12-31T16:00:00Z', ['0101', '1231']],
  ['2027-02-28T16:00:00Z', ['0301', '0228']],
  ['2028-02-29T16:00:00Z', ['0301', '0229']],
];
for (const [instant, expected] of cases) {
  const now = new Date(instant);
  assert.deepEqual(invitationCodes(now), expected);
  expected.forEach(code => assert(validInvitation(code, now)));
  for (const bad of ['0000', '123', '11270', 'abcd', ' 1127', '１１２７']) assert(!validInvitation(bad, now));
}
assert(!validInvitation('1125', new Date('2026-11-27T00:00:00Z')));
assert(!validInvitation('1128', new Date('2026-11-27T00:00:00Z')));
console.log('Invitation calendar checks passed: midnight, previous day, month/year boundaries, leap day, invalid inputs.');
