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

    // Webhook Configuration - CHANGE THIS LINE FOR PRODUCTION
    const WEBHOOK_URL = 'https://n8n.srv1498466.hstgr.cloud/webhook/f2e3f88d-e79d-4bd4-8dba-33966dde2bde';

    // Version Check
    console.log('Enrollment Script V2.6 - Full Fields GET');

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form Submit Triggered');
        
        try {
            const formData = new FormData(form);
            const data = {};

            // Helper to get radio/check value
            const getVal = (name) => formData.get(name);
            const getRadio = (name) => {
                const el = form.querySelector(`input[name="${name}"]:checked`);
                return el ? el.value : null;
            };

            // Basic Info
            const student_id = getVal('student_id');
            const biometric_id = getVal('biometric_id') || '';
            const first_name = getVal('first_name');
            const last_name = getVal('last_name');
            const grade = getRadio('grade');
            const branch = getRadio('branch');
            const school_name = getVal('school_name');
            
            // Subjects
            const selectedSubjects = Array.from(form.querySelectorAll('input[name="subjects"]:checked'))
                .map(cb => cb.value);
            
            if (selectedSubjects.length < 5) {
                alert('Rule: Minimum 5 subjects must be selected.');
                subjectsSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
                subjectsSelect.classList.add('active');
                return;
            }

            // Primary Contact
            const primary_name = getVal('primary_name');
            const primary_number = getVal('primary_number');
            const primary_relation = getRadio('primary_relation');
            const primary_language = getVal('primary_language') === 'Other' ? getVal('primary_language_other') : getVal('primary_language');

            // Secondary Contact
            const secondary_name = getVal('secondary_name');
            const secondary_number = getVal('secondary_number');
            const secondary_relation = getRadio('secondary_relation');
            const secondary_language = getVal('secondary_language') === 'Other' ? getVal('secondary_language_other') : getVal('secondary_language');

            // Enrollment & Fees
            const enrollment_status = getRadio('enrollment_status');
            const enrollment_date = getVal('enrollment_date');
            const fee_paid = getVal('fee_paid');
            const installments = getVal('installments');
            const payment_mode = getVal('payment_mode');

            // Build Params for n8n
            const params = new URLSearchParams();
            params.append('student_id', student_id);
            params.append('biometric_id', biometric_id);
            params.append('first_name', first_name);
            params.append('last_name', last_name);
            params.append('grade', grade);
            params.append('branch', branch);
            params.append('school_name', school_name);
            params.append('subjects_opted', selectedSubjects.join(', '));
            
            params.append('primary_contact_name', primary_name);
            params.append('primary_contact_phone', primary_number);
            params.append('primary_contact_relation', primary_relation);
            params.append('primary_language', primary_language);
            
            params.append('secondary_contact_name', secondary_name);
            params.append('secondary_contact_phone', secondary_number);
            params.append('secondary_contact_relation', secondary_relation);
            params.append('secondary_language', secondary_language);
            
            params.append('enrollment_status', enrollment_status);
            params.append('enrollment_date', enrollment_date);
            params.append('fee_paid', fee_paid);
            params.append('installments', installments);
            params.append('payment_mode', payment_mode);
            params.append('submission_date', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

            const finalUrl = `${WEBHOOK_URL}?${params.toString()}`;
            console.log('Submitting to:', finalUrl);

            fetch(finalUrl, { method: 'GET', mode: 'no-cors' })
            .then(() => console.log('Successfully sent to n8n'))
            .catch(error => console.error('Error sending to n8n:', error));

            // Show 'FORM SUBMITTED' Overlay
            const successOverlay = document.getElementById('successOverlay');
            successOverlay.classList.add('active');

            // Success feedback on button
            const btn = document.getElementById('submitBtn');
            const oldText = btn.textContent;
            btn.textContent = 'Submitted!';
            btn.style.background = '#00b894';

            // Reset form after 3 seconds
            setTimeout(() => {
                successOverlay.classList.remove('active');
                btn.textContent = oldText;
                btn.style.background = '';
                form.reset();
                updateSubjectsText(); // Reset subjects trigger text
            }, 3000);

        } catch (err) {
            console.error('Submission Error:', err);
            alert('Error submitting form. Check console.');
        }
    });
});
