import * as cheerio from 'cheerio';

export default defineEventHandler(async (event) => {
    const { query, searchType = 'title' } = getQuery(event);

    const searchRequest = new SearchRequest(query, searchType);
    return await searchRequest.aggregateRequestData();
});

class SearchRequest {
    static colNames = [
        "ID",
        "Author",
        "Title",
        "Publisher",
        "Year",
        "Pages",
        "Language",
        "Size",
        "Extension",
        "Mirror_1",
        "Mirror_2",
        "Mirror_3",
        "Mirror_4",
        "Mirror_5",
        "Edit",
    ];

    constructor(query, searchType = 'title') {
        this.query = query;
        this.searchType = searchType;

        if (this.query.length < 3) {
            throw new Error("Query is too short");
        }
    }

    stripITagFromSoup($) {
        $('i').remove();
    }

    async getSearchPage() {
        const queryParsed = this.query.split(" ").join("%20");
        let searchUrl;

        // TODO: check whether advanced search returns md5 and coverUrl directly
        if (this.searchType.toLowerCase() === "title") {
            searchUrl = `https://libgen.is/search.php?req=${queryParsed}&column=title`;
        } else if (this.searchType.toLowerCase() === "author") {
            searchUrl = `https://libgen.is/search.php?req=${queryParsed}&column=author`;
        }

        const response = await $fetch(searchUrl);
        return response;
    }

    async aggregateRequestData() {
        const searchPage = await this.getSearchPage();
        const $ = cheerio.load(searchPage);
        this.stripITagFromSoup($);

        const informationTable = $('table').eq(2);
        let outputData = [];

        informationTable.find('tr').slice(1).each((_, row) => {
            const $row = $(row);
            const rowData = {};

            $row.find('td').each((cellIndex, cell) => {
                const $cell = $(cell);
                const columnName = SearchRequest.colNames[cellIndex];
                let cellValue;
                const $a = $cell.find('a');
                if ($a.length && $a.attr('title') && $a.attr('title') !== '') {
                    cellValue = $a.attr('href');
                } else {
                    cellValue = $cell.text().trim();
                }
                rowData[columnName] = cellValue;
            });

            outputData.push(rowData);
        });

        // filter books that are not pdf or epub
        outputData = outputData.filter(book => book.Extension.toLowerCase() === 'pdf' || book.Extension.toLowerCase() === 'epub');

        const details = await this.getBookDetails(outputData);

        outputData = outputData.map((book, index) => ({
            id: book.ID,
            title: book.Title,
            author: book.Author,
            coverUrl: details[index].coverurl ? `https://library.lol/covers/${details[index].coverurl}` : null,
            md5: details[index].md5 || null,
            extension: book.Extension,
        }));

        return outputData;
    }

    async getBookDetails(outputData) {
        try {
            const idsStr = outputData.map(book => book.ID).join(',');
            const detailsUrl = `https://libgen.is/json.php?ids=${idsStr}&fields=md5,coverurl`;
            return await $fetch(detailsUrl);
        } catch (error) {
            console.error('Error fetching book details:', error);
            return [];
        }
    }
}