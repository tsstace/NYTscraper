(function () {

    // Load after page renders
    $(function () {
      loadListeners();
    });
  
    // Event listeners
    function loadListeners() {
  
      // Viewing note
      $('.note').on('click', function (event) {
        event.preventDefault();
  
        // Caching id and modal
        var docID = $(this).data('id');
        var $modal = $('#viewNote');
  
        // Caching form elements
        var $title = $modal.find('input[name="title"]');
        var $body = $modal.find('textarea[name="body"]');
        var $hidden = $('.note-data');
  
        // Reset form
        $title.val('');
        $body.val('');
        $hidden.html('');
  
        // Add Article title to note
        $modal.find('.modal-title > span').text($(this).data('title'));
  
        sendRequest('/articles/' + docID, 'GET', {}, function (data) {
          console.log(data);
  
          // If there is a note, pre-fill those values into form elements
          if (data.note) {
            $title.val(data.note.title);
            $body.val(data.note.body);
          }
  
          // Add ID as attribute, will access this later when submitting
          $('#note-form').attr('action', '/articles/' + docID);
          $hidden.html('<input type="hidden" name="id" value="' + docID + '" />');
  
          // Load modal
          $modal.modal();
        });
  
      });
  
      // On form submit
      $('#note-form').on('submit', function (event) {
        event.preventDefault();
  
        $form = $(this);
  
        sendRequest($form.attr('action'), $form.attr('method'), $form.serialize(), function (data) {
          console.log(data);
  
          // Find the form document ID then find the note link with the matching data-id attribute
          $note = $('a[data-id="'+$form.find('[name="id"]').val()+'"]');
  
          if($note.hasClass('btn-info')) {
            $note
              .removeClass('btn-info')
              .addClass('btn-success')
              .text('View Note');
          }
  
          $('#viewNote').modal('hide');
  
        });
      });
    }
  
    // Ajax request
    function sendRequest(url, method, data, callback) {
      $.ajax({
        url: url,
        method: method.toUpperCase(),
        data: data
      })
        .done(callback)
        .fail(function (err) {
          console.log('Error when sending request: ', err);
        });
    }
  
  })();