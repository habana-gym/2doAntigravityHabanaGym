// Mock Data Service
// Simulates a backend database

export const initialClients = [
    {
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '099123456',
        status: 'active', // active, inactive, debtor
        membershipType: 'Mensual',
        startDate: '2025-11-01',
        endDate: '2025-12-01',
        photo: null,
        debt: 0,
        attendance: 15,
        planId: 'plan-1',
    },
    {
        id: '2',
        firstName: 'Maria',
        lastName: 'García',
        email: 'maria@example.com',
        phone: '099654321',
        status: 'debtor',
        membershipType: 'Trimestral',
        startDate: '2025-08-01',
        endDate: '2025-11-01', // Expired
        photo: null,
        debt: 1500,
        attendance: 45,
        planId: 'plan-2',
    },
    {
        id: '3',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos@example.com',
        phone: '098111222',
        status: 'inactive',
        membershipType: 'Mensual',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
        photo: null,
        debt: 0,
        attendance: 0,
        planId: null,
    },
];

export const initialStats = {
    activeClients: 125,
    debtorClients: 12,
    inactiveClients: 45,
    monthlyRevenue: 150000,
    dailyAttendance: 34,
};

export const recentActivity = [
    { id: 1, type: 'checkin', user: 'Juan Pérez', time: '10:30 AM', status: 'success' },
    { id: 2, type: 'payment', user: 'Ana López', amount: 1500, time: '10:15 AM' },
    { id: 3, type: 'checkin', user: 'Maria García', time: '09:45 AM', status: 'warning' }, // Debtor
    { id: 4, type: 'new_user', user: 'Pedro Silva', time: '09:00 AM' },
];

export const getClients = () => {
    // In a real app, this would fetch from API
    return initialClients;
};

export const getStats = () => {
    return initialStats;
};
```javascript
// Mock Data Service
// Simulates a backend database

export const initialClients = [
    {
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '099123456',
        status: 'active', // active, inactive, debtor
        membershipType: 'Mensual',
        startDate: '2025-11-01',
        endDate: '2025-12-01',
        photo: null,
        debt: 0,
        attendance: 15,
        planId: 'plan-1',
    },
    {
        id: '2',
        firstName: 'Maria',
        lastName: 'García',
        email: 'maria@example.com',
        phone: '099654321',
        status: 'debtor',
        membershipType: 'Trimestral',
        startDate: '2025-08-01',
        endDate: '2025-11-01', // Expired
        photo: null,
        debt: 1500,
        attendance: 45,
        planId: 'plan-2',
    },
    {
        id: '3',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos@example.com',
        phone: '098111222',
        status: 'inactive',
        membershipType: 'Mensual',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
        photo: null,
        debt: 0,
        attendance: 0,
        planId: null,
    },
];

export const initialStats = {
    activeClients: 125,
    debtorClients: 12,
    inactiveClients: 45,
    monthlyRevenue: 150000,
    dailyAttendance: 34,
};

export const recentActivity = [
    { id: 1, type: 'checkin', user: 'Juan Pérez', time: '10:30 AM', status: 'success' },
    { id: 2, type: 'payment', user: 'Ana López', amount: 1500, time: '10:15 AM' },
    { id: 3, type: 'checkin', user: 'Maria García', time: '09:45 AM', status: 'warning' }, // Debtor
    { id: 4, type: 'new_user', user: 'Pedro Silva', time: '09:00 AM' },
];

export const getClients = () => {
    // In a real app, this would fetch from API
    return initialClients;
};

export const getStats = () => {
    return initialStats;
};

export const getRecentActivity = () => {
    return recentActivity;
};

export const getClientById = (id) => {
    return initialClients.find(client => client.id === id);
};

export const addClient = (client) => {
  const newClient = {
    ...client,
    id: (initialClients.length + 1).toString(),
    status: 'active',
    photo: null,
    debt: 0,
    attendance: 0,
    planId: null,
  };
  initialClients.push(newClient);
  return newClient;
};

export const initialExercises = [
  { id: '1', name: 'Sentadilla', muscleGroup: 'Piernas', videoUrl: '' },
  { id: '2', name: 'Press de Banca', muscleGroup: 'Pecho', videoUrl: '' },
  { id: '3', name: 'Peso Muerto', muscleGroup: 'Espalda/Piernas', videoUrl: '' },
  { id: '4', name: 'Dominadas', muscleGroup: 'Espalda', videoUrl: '' },
  { id: '5', name: 'Press Militar', muscleGroup: 'Hombros', videoUrl: '' },
];

export const initialWorkoutPlans = [
  { id: 1, name: 'Hipertrofia Principiante', duration: '4 semanas', level: 'Principiante', exercises: 5 },
  { id: 2, name: 'Pérdida de Grasa', duration: '8 semanas', level: 'Intermedio', exercises: 8 },
  { id: 3, name: 'Fuerza Avanzada', duration: '12 semanas', level: 'Avanzado', exercises: 6 },
];

export const getExercises = () => initialExercises;

export const addExercise = (exercise) => {
  const newExercise = { ...exercise, id: (initialExercises.length + 1).toString() };
  initialExercises.push(newExercise);
  return newExercise;
};

export const getWorkoutPlans = () => initialWorkoutPlans;

export const addWorkoutPlan = (plan) => {
  const newPlan = { ...plan, id: initialWorkoutPlans.length + 1 };
  initialWorkoutPlans.push(newPlan);
  return newPlan;
};
```
