# Free Etsy Scraper

This Etsy scraper uses Jina to find Etsy search results that already have reviews, and therefore we know they are selling. 

## How to make this work for you

Basically, all you need to do is change the .env file to fit your requirements. The more numbers you put inside the REVIEW_NUMBERS variable, the more results you get. The more country codes you put inside the HREF_LANGTAGS variable, the more results you will get, and then you can also vary what object you are looking for, but I recommend only doing one at a time

Example .env

JINA_API_KEY=X
CLAUDE_API_KEY=X
REVIEW_NUMBERS=399,400,401,402,403
HREFLANG_TAGS=uk,ie
SEARCH_OBJECT=t-shirt

