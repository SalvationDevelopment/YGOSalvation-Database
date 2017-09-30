/*global $*/
var database = [];

$.getJSON('./manifest_0-en-OCGTCG.json', function(data) {
    database = data;
});


function protoQuery() {
    var text = $('#search').val(),
        matchingNames = [];
    if (text.length < 4) {
        $('datalist').html('');
        return;
    }
    $('#cards').html(database.filter(function(item) {
            return (item.name.toLowerCase().indexOf(text.toLowerCase()) >= 0);
        })
        .map(function(item) {
            return '<option value="' + item.name + '"></option>';
        })
        .join(''));

}