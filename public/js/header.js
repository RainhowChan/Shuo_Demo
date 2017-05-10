var index = 1;
$('.comment').on('click', function (event, init) {
    var attr = $(this).attr('data-type');
    if (!init && index === parseInt(attr)) {
        return;
    }
    $(this).addClass('active').siblings().removeClass('active');
    index = parseInt(attr);
    $.get('/getComment', {type: index}, function (json) {
        if (json.status === 200) {
            $('#comment-container').empty();
            var compiled = _.template($('#comment-template').html());
            var html = '';
            for (var i = 0; i < json.result.length; i++) {
                html += compiled(json.result[i]);
            }
            $('#comment-container').append(html);
        } else {
            if (!init) {
                alert(json.result);
            }
        }
    });
});

$('.comment.active').trigger('click', true);
