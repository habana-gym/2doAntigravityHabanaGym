const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugUpdate() {
    console.log('Debugging Update Plan...');

    // 1. Get a plan
    const { data: plans } = await supabase.from('plans').select('id, name').limit(1);
    if (!plans || plans.length === 0) {
        console.error('No plans found.');
        return;
    }
    const planId = plans[0].id; // 269cf405-3592-4ed3-96b5-bdf24fd0df07
    console.log('Testing update on Plan:', planId);

    // 2. Get an exercise
    const { data: exercises } = await supabase.from('exercises').select('id').limit(1);
    const exerciseId = exercises[0].id;

    // 3. Define updates
    const planData = {
        name: 'Updated via Debug Script',
        duration: '10 weeks',
        level: 'Avanzado',
        exercises: [
            {
                id: exerciseId,
                sets: '5',
                reps: '5',
                weight: '100kg',
                rest_time: '3min',
                notes: 'Debug Note'
            }
        ]
    };

    console.log('Updating...');

    // Simulate updateWorkoutPlan logic manually to see where it breaks

    // A. Update Plan Details
    const { error: planError } = await supabase
        .from('plans')
        .update({
            name: planData.name,
            duration: planData.duration,
            level: planData.level
        })
        .eq('id', planId);

    if (planError) {
        console.error('Plan Update Error:', planError);
        return;
    }
    console.log('Plan details updated.');

    // B. Sync Exercises (Delete)
    const { error: delError } = await supabase
        .from('plan_exercises')
        .delete()
        .eq('plan_id', planId);

    if (delError) {
        console.error('Delete Exercises Error:', delError);
        return;
    }
    console.log('Old exercises deleted.');

    // C. Sync Exercises (Insert)
    const planExercises = planData.exercises.map(ex => ({
        plan_id: planId,
        exercise_id: ex.id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest_time: ex.rest_time,
        notes: ex.notes
    }));

    const { error: insError } = await supabase
        .from('plan_exercises')
        .insert(planExercises);

    if (insError) {
        console.error('Insert Exercises Error:', insError);
        return;
    }

    console.log('Update Complete Successfully!');
}

debugUpdate();
