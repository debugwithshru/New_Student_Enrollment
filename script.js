document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('enrollmentForm');
    const enrollmentDateInput = document.getElementById('enrollment_date');
    const subjectsSelect = document.getElementById('subjectsSelect');
    const subjectsTrigger = subjectsSelect.querySelector('.multi-select-trigger');
    const subjectsOptions = subjectsSelect.querySelectorAll('input[name="subjects"]');

    // Set default enrollment date to today
    const today = new Date().toISOString().split('T')[0];
    enrollmentDateInput.value = today;

    // Multi-select dropdown logic
    subjectsTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        subjectsSelect.classList.toggle('active');
    });

    // Close multi-select when clicking outside
    document.addEventListener('click', (e) => {
        if (!subjectsSelect.contains(e.target)) {
            subjectsSelect.classList.remove('active');
        }
    });

    // Update trigger text for multi-select
    const updateSubjectsText = () => {
        const selected = Array.from(subjectsOptions)
            .filter(opt => opt.checked)
            .map(opt => opt.value);
        
        if (selected.length === 0) {
            subjectsTrigger.textContent = 'Select Subjects...';
            subjectsTrigger.style.color = '#636e72';
        } else if (selected.length <= 2) {
            subjectsTrigger.textContent = selected.join(', ');
            subjectsTrigger.style.color = '#2d3436';
        } else {
            subjectsTrigger.textContent = `${selected.length} Subjects Selected`;
            subjectsTrigger.style.color = '#2d3436';
        }
    };

    subjectsOptions.forEach(opt => {
        opt.addEventListener('change', updateSubjectsText);
    });

    // Toggle "Other" Language logic
    window.toggleOtherLanguage = (selectElement, otherInputId) => {
        const otherInput = document.getElementById(otherInputId);
        if (selectElement.value === 'Other') {
            otherInput.style.display = 'block';
            otherInput.required = true;
        } else {
            otherInput.style.display = 'none';
            otherInput.required = false;
        }
    };

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {};

        // Helper to get radio value
        const getRadioValue = (name) => {
            const radio = form.querySelector(`input[name="${name}"]:checked`);
            return radio ? radio.value : null;
        };

        // Standard fields
        data.student_id = formData.get('student_id');
        data.biometric_id = formData.get('biometric_id');
        data.first_name = formData.get('first_name');
        data.last_name = formData.get('last_name');
        data.grade = getRadioValue('grade');
        data.branch = getRadioValue('branch');
        data.school_name = formData.get('school_name');
        
        // Multi-select subjects
        data.subjects_opted = Array.from(subjectsOptions)
            .filter(opt => opt.checked)
            .map(opt => opt.value);

        // Primary Contact
        data.primary_contact_name = formData.get('primary_name');
        data.primary_contact_number = formData.get('primary_number');
        data.primary_contact_relation = getRadioValue('primary_relation');
        data.primary_language = formData.get('primary_language') === 'Other' 
            ? formData.get('primary_language_other') 
            : formData.get('primary_language');

        // Secondary Contact
        data.secondary_contact_name = formData.get('secondary_name');
        data.secondary_contact_number = formData.get('secondary_number');
        data.secondary_contact_relation = getRadioValue('secondary_relation');
        data.secondary_language = formData.get('secondary_language') === 'Other' 
            ? formData.get('secondary_language_other') 
            : formData.get('secondary_language');

        // Enrollment
        data.enrollment_status = getRadioValue('enrollment_status');
        data.enrollment_date = formData.get('enrollment_date');

        // Prior Academic Record
        data.prior_year_school = formData.get('prior_school');
        data.prior_year_exam_name = formData.get('prior_exam');
        
        // Marks
        data.prior_maths_obtained = formData.get('prior_maths_ob');
        data.prior_maths_max = formData.get('prior_maths_max');
        data.prior_science_obtained = formData.get('prior_science_ob');
        data.prior_science_max = formData.get('prior_science_max');
        data.prior_english_obtained = formData.get('prior_english_ob');
        data.prior_english_max = formData.get('prior_english_max');
        data.prior_socsci_obtained = formData.get('prior_socsci_ob');
        data.prior_socsci_max = formData.get('prior_socsci_max');
        data.prior_secondlang_obtained = formData.get('prior_lang2_ob');
        data.prior_secondlang_max = formData.get('prior_lang2_max');

        // Final payload structure for n8n/Sheets
        console.log('Enrollment Data:', data);
        
        // Show success message (simple version)
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enrolling...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('Student Registered Successfully!\nData logged to console.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            // form.reset(); // Uncomment to reset form after success
        }, 1000);
    });
});
