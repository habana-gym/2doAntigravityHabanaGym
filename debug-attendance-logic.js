
// Mock logic from src/app/(authenticated)/attendance/page.js

function checkAccess(client, graceDays) {
    const now = new Date();
    // Normalize "now" to midnight for fair comparison (matches page.js logic)
    now.setHours(0, 0, 0, 0);

    const endDate = new Date(client.end_date);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = now - endDate;
    // Difference in days. Positive = Expired X days ago. Negative = X days remaining.
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let accessGranted = false;
    let status = '';

    if (client.status === 'active' && diffDays <= 0) {
        accessGranted = true;
        status = 'ACTIVE_OK';
    } else {
        if (diffDays > 0 && diffDays <= graceDays) {
            accessGranted = true;
            status = `GRACE_PERIOD (Expired ${diffDays} days ago)`;
        } else if (diffDays > graceDays) {
            accessGranted = false;
            status = `DENIED_EXPIRED (Expired ${diffDays} days ago)`;
        } else if (client.status === 'debtor') {
            accessGranted = false;
            status = 'DENIED_DEBTOR';
        } else {
            // It might reach here if status is active but diffDays > 0? 
            // Wait, if status is 'active' but diffDays > 0, it falls into the else block.
            // If diffDays > 0 and <= graceDays, it's Grace Period.
            // If diffDays > graceDays, it's Denied.
            // So logic seems sound.
            accessGranted = true;
            status = 'FALLBACK_OK';
        }
    }

    return { accessGranted, status, diffDays };
}

// Test Cases
const today = new Date();
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
const fiveDaysAgo = new Date(today); fiveDaysAgo.setDate(today.getDate() - 5);
const sixDaysAgo = new Date(today); sixDaysAgo.setDate(today.getDate() - 6);
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

const cases = [
    {
        name: 'Client Active (Expires Tomorrow)',
        client: { status: 'active', end_date: tomorrow.toISOString(), first_name: 'Juan' },
        expected: true
    },
    {
        name: 'Client Expired Yesterday (Grace Period)',
        client: { status: 'active', end_date: yesterday.toISOString(), first_name: 'Pedro' },
        expected: true // Should be allowed
    },
    {
        name: 'Client Expired 5 Days Ago (Last Day of Grace)',
        client: { status: 'active', end_date: fiveDaysAgo.toISOString(), first_name: 'Luis' },
        expected: true // Should be allowed if grace is 5
    },
    {
        name: 'Client Expired 6 Days Ago (Expired)',
        client: { status: 'active', end_date: sixDaysAgo.toISOString(), first_name: 'Ana' },
        expected: false // Should be denied
    },
    {
        name: 'Client Debtor (Manual)',
        client: { status: 'debtor', end_date: tomorrow.toISOString(), first_name: 'Carlos' }, // Date valid but status debtor?
        // Wait, the logic prioritizes "active && diffDays <= 0".
        // If status is 'debtor', diffDays <= 0, it enters the FIRST if?
        // Let's check the code:
        // if (client.status === 'active' && diffDays <= 0)
        // So if status is 'debtor', it goes to ELSE.
        // inside ELSE: if diffDays <= 0 (it is, since tomorrow), diffDays is negative.
        // It skips "diffDays > 0" checks.
        // It hits "else if (client.status === 'debtor')" -> DENIED.
        // Correct.
        expected: false
    }
];

const GRACE_DAYS = 5;

console.log('--- Testing Attendance Logic (Grace Days: 5) ---');
cases.forEach(c => {
    const result = checkAccess(c.client, GRACE_DAYS);
    const pass = result.accessGranted === c.expected;
    console.log(`${pass ? '✅' : '❌'} ${c.name}: Expected ${c.expected}, Got ${result.accessGranted} (${result.status})`);
});
