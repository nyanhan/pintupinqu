  Usage: pin [options]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -l, --listen <port>  start pin server, listen <port> (< 1024 needs sudo).
    -s, --server <port>  start static server, listen <port> (< 1024 needs sudo).
    -p, --pack           pack & min code for release.
    -v, --new_version    generate new version number.
    --no-compress        pack code do not compress.

http://pintupinqu.com/(\d{12})/path/to/the/file
>>> http://pintupinqu.com/_src_/path/to/the/file


// css image domain replacement
/*@source image1.kantuban.com image1.kantuban.com*/

// async load script, with min file packed
/*@pack */


release log:
1. update uglifyjs to 2
2. update clean-css
3. clean code
4. auto filter duplicate files // TODO bug only in one min file
