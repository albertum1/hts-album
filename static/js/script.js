function removeDuplicates(array) {
    let x = {};
    array.forEach(function(i) {
        if (!x[i]) {
            x[i] = true
        }
    })
    return Object.keys(x)
};
// helper function to reduce '.'
String.prototype.commafy = function() {
    return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
        return $1 + $2.replace(/\d(?=(?:\d\d)+(?!\d))/g, "$&.");
    });
};

function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};


var blah = null;
$.ajax({
    'async': false,
    'global': false,
    'url': "./20exclusions.json",
    'dataType': "json",
    'success': function(data) {
        blah = data;
    }
});

var arr = null;
$.ajax({
    'async': false,
    'global': false,
    'url': "./hts_2020_revision_14_json.json",
    'dataType': "json",
    'success': function(data) {
        arr = data;
    }
});
var jsonrev = arr;
jsonrev.reverse();



$(document).ready(function() {
    $("#myBtn").click(function() {
        $('#employee_table tr').not(function() {
            return !!$(this).has('th').length;
        }).remove();
        $('#exclusions tr').not(function() {
            return !!$(this).has('th').length;
        }).remove();
        // If Input length is 0 input becomes 'Empty'
        // var str will be INPUT
        var str = $("#myInput").val();
        if (str.length == 0) {
            str = "Empty";
        }
        // apply helper function to remove '.';
        str = str.replace(/\./g, '').commafy()
        // I don't know why this is here.
        if (str[2] == '.') {
            str = str.slice(0, 2) + str.slice(3);
        }
        // jsonrev is the given hts json file REVERSED;

        for (var i in jsonrev) {
            // if input matches an htsno in json file return outputs;
            if (jsonrev[i].htsno == str) {
                var newlist = [jsonrev[i]];
                var indented = jsonrev[i].indent;
                var index = jsonrev.findIndex(function(item, i) {
                    return item.htsno === str
                });

                var jsonrevslice = jsonrev.slice(index)
                for (var k in jsonrevslice) {
                    if (indented > jsonrevslice[k].indent) {
                        indented = jsonrevslice[k].indent
                        newlist.push(jsonrevslice[k])
                    } else if (indented === 0) {
                        break;
                    } else {
                        continue;
                    }
                }

                newlist.reverse();
            };

        };
        var found = ''
        var how = '';
        for (var f in newlist) {
            try {
                if (newlist[f].footnotes.length > 0) {
                    for (var j in newlist[f].footnotes) {
                        how += ' ' + newlist[f].footnotes[j].value;
                        if (how.match(/\d{4}\.\d\d\.\d\d\sthrough\s\d{4}\.\d\d\.\d\d\s/g) == null) {
                            var found1 = how.match(/\d{4}\.\d\d\.\d\d/g)
                        } else {
                            var found1 = how.match(/\d{4}\.\d\d\.\d\d\sthrough\s\d{4}\.\d\d\.\d\d\s/g);
                        }
                        var found2 = found1[0].match(/\d{4}\.\d\d\.\d\d/g);
                        var found3 = how.match(/\d{4}\.\d\d\.\d\d/g);
                        for (var yes in found2) {
                            found2[yes] = found2[yes].replace(/\./g, '')
                        }
                        var rangenumbers = range(parseInt(found2[0]), parseInt(found2[1]) + 1);
                        var rangenumbers = rangenumbers.map(String)
                        for (var yesno in rangenumbers) {
                            rangenumbers[yesno] = rangenumbers[yesno].commafy();
                            if (rangenumbers[yesno][2] == '.') {
                                rangenumbers[yesno] = rangenumbers[yesno].slice(0, 2) + rangenumbers[yesno].slice(3);
                            }

                        }
                        found = found3.concat(rangenumbers);
                        found = found.sort();
                        found = removeDuplicates(found);
                    }
                }
            } catch (err) {}
        }




        for (var a in found) {
            for (var z in jsonrev) {
                if (found[a] == jsonrev[z].htsno) {
                    newlist.push(jsonrev[z]);
                };
            };
        };




        if (str[10] == '.') {
            notestr = str.slice(0, 10) + str.slice(11);
        }
        var title = '';

        for (var t in newlist) {
            if (newlist[t].description.search(/20\(\w+\)/g) > 0) {
                var matchme = newlist[t].description.match(/20\(\w+\)/g)
                for (var w in blah[matchme]) {
                    if (blah[matchme][w].htsno == notestr) {
                        title += '<tr>';
                        title += '<td>' + newlist[t].htsno + '</td>';
                        title += '<td>' + blah[matchme][w].text + '</td>';
                        title += '<td>' + matchme + '</td>';

                    }
                }


            }
        }
        $('#exclusions').append(title);




        var table_data = ''
        for (var u in newlist) {
            table_data += '<tr>';
            table_data += '<td>' + newlist[u].htsno + '</td>';
            table_data += '<td>' + newlist[u].indent + '</td>';
            table_data += '<td>' + newlist[u].description + '</td>';
            table_data += '<td>' + newlist[u].units + '</td>';
            table_data += '<td>' + newlist[u].general + '</td>';
            table_data += '<td>' + newlist[u].special + '</td>';
            table_data += '<td>' + newlist[u].other + '</td>';
            try {
                if (newlist[u].footnotes.length > 0) {
                    var what = '';
                    for (t in newlist[u].footnotes) {
                        what += ' ' + newlist[u].footnotes[t].value;
                    }
                    table_data += '<td>' + what + '</td>';




                } else {
                    table_data += '<td>' + newlist[u].footnotes + '</td>';
                }
            } catch (err) {
                table_data += '<td>' + '</td>';
            }
        };
        $('#employee_table').append(table_data);



    });



});