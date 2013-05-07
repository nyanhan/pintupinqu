  Usage: pin [options]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -i, --init           init a new project.
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

// datauri root path
/*@datauri */


release log:
* update uglifyjs to 2
* update clean-css
* clean code
* auto filter duplicate files
* LESS support
