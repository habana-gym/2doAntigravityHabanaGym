import { supabase } from '@/lib/supabase';

// --- Clients ---

export const getClients = async () => {
    const { data, error } = await supabase
        .from('clients')
        .select('*, plans(name)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getClientById = async (id) => {
    const { data, error } = await supabase
        .from('clients')
        .select('*, plans(name, id)')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const addClient = async (client) => {
    const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateClient = async (id, updates) => {
    const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteClient = async (id) => {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// --- Memberships ---

export const getMemberships = async () => {
    const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .order('price');
    if (error) throw error;
    return data;
};

export const addMembership = async (membership) => {
    const { data, error } = await supabase
        .from('memberships')
        .insert([membership])
        .select()
        .single();
    if (error) throw error;
    return data;
    return data;
};

export const updateMembership = async (id, updates) => {
    const { data, error } = await supabase
        .from('memberships')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteMembership = async (id) => {
    const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// --- Payments ---

export const addPayment = async (payment) => {
    const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const getClientPayments = async (clientId) => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });
    if (error) throw error;
    return data;
};

export const getMonthlyPayments = async () => {
    // Get payments for current year
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();

    const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, date')
        .gte('date', startOfYear);

    if (error) throw error;

    // Aggregate by month
    const monthlyStats = Array(12).fill(0).map((_, i) => ({
        month: new Date(0, i).toLocaleString('es-ES', { month: 'short' }), // Ene, Feb, etc.
        total: 0
    }));

    payments.forEach(p => {
        const monthIndex = new Date(p.date).getMonth();
        monthlyStats[monthIndex].total += p.amount;
    });

    return monthlyStats;
};

// --- System Settings ---

export const getSettings = async () => {
    const { data, error } = await supabase
        .from('system_settings')
        .select('*');

    if (error) {
        console.error('Error fetching settings:', error);
        return [];
    }

    // Convert array to object for easier access { key: value }
    return data.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});
};

export const updateSetting = async (key, value) => {
    const { data, error } = await supabase
        .from('system_settings')
        .upsert({ key, value })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getExercises = async () => {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
};

export const addExercise = async (exercise) => {
    const { data, error } = await supabase
        .from('exercises')
        .insert([exercise])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateExercise = async (id, updates) => {
    const { data, error } = await supabase
        .from('exercises')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteExercise = async (id) => {
    const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// --- Workout Plans ---

export const getWorkoutPlans = async () => {
    const { data, error } = await supabase
        .from('plans')
        .select('*, exercises:plan_exercises(count)');

    if (error) throw error;
    // Transform to match UI expectation if needed
    return data.map(plan => ({
        ...plan,
        exercises: plan.exercises[0]?.count || 0
    }));
};

export const getWorkoutPlanById = async (id) => {
    const { data, error } = await supabase
        .from('plans')
        .select(`
            *,
            plan_exercises (
                exercise:exercises(*),
                sets,
                reps,
                weight,
                rest_time,
                notes
            )
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const addWorkoutPlan = async (plan) => {
    // 1. Insert Plan
    const { data: newPlan, error: planError } = await supabase
        .from('plans')
        .insert([{
            name: plan.name,
            duration: plan.duration,
            level: plan.level
        }])
        .select()
        .single();

    if (planError) throw planError;

    // 2. Insert Exercises (if any)
    if (plan.exerciseIds && plan.exerciseIds.length > 0) {
        const planExercises = plan.exerciseIds.map(ex => ({
            plan_id: newPlan.id,
            exercise_id: ex.id || ex,
            sets: ex.sets || null,
            reps: ex.reps || null,
            weight: ex.weight || null,
            rest_time: ex.rest_time || null,
            notes: ex.notes || null
        }));

        const { error: exError } = await supabase
            .from('plan_exercises')
            .insert(planExercises);

        if (exError) throw exError;
    }

    return newPlan;
};

export const updateWorkoutPlan = async (id, planData) => {
    // 1. Update Plan Details
    const { data: updatedPlan, error: planError } = await supabase
        .from('plans')
        .update({
            name: planData.name,
            duration: planData.duration,
            level: planData.level
        })
        .eq('id', id)
        .select()
        .single();

    if (planError) throw planError;

    // 2. Sync Exercises (Delete all and Re-insert) -> Simple strategy
    // First delete existing relations
    const { error: delError } = await supabase
        .from('plan_exercises')
        .delete()
        .eq('plan_id', id);

    if (delError) throw delError;

    // Then insert new ones
    if (planData.exercises && planData.exercises.length > 0) {
        const planExercises = planData.exercises.map(ex => ({
            plan_id: id,
            exercise_id: ex.id || ex.exercise_id || ex.exercise.id, // Handle various shapes
            sets: ex.sets || null,
            reps: ex.reps || null,
            weight: ex.weight || null,
            rest_time: ex.rest_time || null,
            notes: ex.notes || null
        }));

        const { error: insError } = await supabase
            .from('plan_exercises')
            .insert(planExercises);

        if (insError) throw insError;
    }

    return updatedPlan;
};

export const deleteWorkoutPlan = async (id) => {
    const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// --- Attendance ---

export const recordAttendance = async (clientId, accessGranted) => {
    const { data, error } = await supabase
        .from('attendance')
        .insert([{
            client_id: clientId,
            access_granted: accessGranted
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// --- Dashboard & Stats ---

export const getDashboardStats = async () => {
    const { count: activeCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    const { count: debtorCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'debtor');

    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().setDate(1)).toISOString();

    const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', today);

    // Calculate Real Revenue from Payments this month
    const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .gte('date', firstDayOfMonth);

    const monthlyRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
        activeClients: activeCount || 0,
        debtorClients: debtorCount || 0,
        dailyAttendance: attendanceCount || 0,
        monthlyRevenue: monthlyRevenue
    };
};

export const getRecentActivity = async () => {
    const { data, error } = await supabase
        .from('attendance')
        .select('*, clients(first_name, last_name)')
        .order('timestamp', { ascending: false })
        .limit(5);

    if (error) throw error;

    return data.map(record => ({
        id: record.id,
        type: 'checkin',
        user: record.clients ? `${record.clients.first_name} ${record.clients.last_name}` : 'Desconocido',
        time: new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: record.access_granted ? 'success' : 'warning'
    }));
};

export const getWeeklyAttendance = async () => {
    const { data, error } = await supabase
        .rpc('get_weekly_attendance');

    if (error) {
        console.error('Error fetching weekly stats:', error);
        return [];
    }

    // Map to ensure we have all 7 days even if DB returns partial (though the PG function handles series)
    // The PG function returns { day_name, day_date, count }
    return data.map(d => ({
        name: d.day_name,
        date: d.day_date,
        asistencias: d.count
    }));
};
