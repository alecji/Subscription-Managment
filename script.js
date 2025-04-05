$(document).ready(() => {
    const API_URL = 'api.php';
    
    function showError(message, formId) {
        $(`#${formId} .error-message`).text(message).show();
        setTimeout(() => $(`#${formId} .error-message`).hide(), 3000);
    }
    
    // Load subscribers
    function loadSubscribers() {
        $('#loading').show();
        $('#subscribersList').empty();
        $('#list-error').hide();
        
        $.getJSON(`${API_URL}?action=list`)
            .done((data) => {
                $('#loading').hide();
                
                if (data.success && data.subscribers && data.subscribers.length > 0) {
                    // Render subscribers
                    for (const sub of data.subscribers) {
                        $('#subscribersList').append(`
                            <tr>
                                <td>${sub.name}</td>
                                <td>${sub.email}</td>
                                <td>
                                    <button class="btn btn-sm btn-danger unsubscribe-btn" data-email="${sub.email}">
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        `);
                    }
                } else {
                    $('#subscribersList').html('<tr><td colspan="3" class="text-center">No subscribers</td></tr>');
                }
            })
            .fail(() => {
                $('#loading').hide();
                $('#subscribersList').html('<tr><td colspan="3" class="text-center">Error loading data</td></tr>');
                $('#list-error').text('Could not load subscribers').show();
            });
    }
    
    // Initial load
    loadSubscribers();
    
    // Subscribe form
    $('#subscribeForm').on('submit', (e) => {
        e.preventDefault();
        
        const name = $('#name').val();
        const email = $('#email').val();
        
        // Hide any previous error
        $('#subscribe-error').hide();
        
        $.ajax({
            url: `${API_URL}?action=subscribe`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ name, email }),
            success: (data) => {
                $('#name').val('');
                $('#email').val('');
                $('#subscribe-success').text('Subscription successful!').show();
                setTimeout(() => $('#subscribe-success').hide(), 3000);
                loadSubscribers();
            },
            error: (xhr) => {
                const errorMsg = xhr.responseJSON?.error || 'Subscription failed';
                showError(errorMsg, 'subscribeForm');
            }
        });
    });
    
    // Unsubscribe form
    $('#unsubscribeForm').on('submit', (e) => {
        e.preventDefault();
        
        const email = $('#unsubEmail').val();
        
        // Hide any previous error
        $('#unsubscribe-error').hide();
        
        $.ajax({
            url: `${API_URL}?action=unsubscribe`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email }),
            success: () => {
                $('#unsubEmail').val('');
                $('#unsubscribe-success').text('Unsubscribed successfully!').show();
                setTimeout(() => $('#unsubscribe-success').hide(), 3000);
                loadSubscribers();
            },
            error: (xhr) => {
                const errorMsg = xhr.responseJSON?.error || 'Unsubscribe failed';
                showError(errorMsg, 'unsubscribeForm');
            }
        });
    });
    
    // Unsubscribe button in list
    $(document).on('click', '.unsubscribe-btn', function() {
        const email = $(this).data('email');
        
        // Hide any previous list error
        $('#list-error').hide();
        
        $.ajax({
            url: `${API_URL}?action=unsubscribe`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email }),
            success: () => {
                loadSubscribers();
            },
            error: xhr => {
                const errorMsg = xhr.responseJSON?.error || 'Unsubscribe failed';
                $('#list-error').text(errorMsg).show();
            }
        });
    });
    
});