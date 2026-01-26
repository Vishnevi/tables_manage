import { google } from "googleapis";
import { getUserAuth } from "../auth/authUser.js";

const TEMPLATE_TR = {
    'Track': [
        ['ID', 'Title', 'Version', 'Artist', 'Foreign ID', 'Project ID', 'ISRC', 'Label', 'P Line', 'Duration', 'Mechanical Rate Basis', 'Custom US Statutory Mechanical Rate', 'Custom Canadian Statutory Mechanical Rate', 'Report Mechanicals', 'Catalogue Groups', 'Default Release Distribution Channel', 'Default Release Cat No', 'Aliases'],
        ['Leave blank if a new Track', '', '', '', '', '', '', '', '', 'Number of seconds', 'Sale Date or Custom', '', '', 'TRUE or FALSE', 'Separate multiple groups using a semi-colon (;)', 'Must match your Distribution Channels setup in Settings', '', 'Separate multiple aliases using a semi-colon (;)']
    ],
    'Track Rights': [
        ['ISRC', 'Sales Contract Name', 'Sales Contract Percentage', 'Costs Contract Name', 'Costs Contract Percentage'],
        ['', 'Map the track to the contract by using the Contract Name', 'Contract Percentage, a number', 'Map the track to the contract by using the Contract Name', 'Contract Percentage, a number']
    ],
    'Mechanicals': [
        ['ISRC', 'Composer Name', 'Composer CAE Number', 'Publisher Name', 'Publisher CAE Number', 'Contract Name', 'License No', 'Rate', 'Share']
    ],
    'Release Specific Rights': [
        ['ISRC', 'Release Distribution Channel', 'Release Cat No', 'Contract', 'Percentage']
    ],
    'Reference': [
        ['TRUE', 'Sale Date'],
        ['FALSE', 'Custom']
    ]
};

const TEMPLATE_WR = {
    'Works': [
        ['ID', 'Title', 'Composers', 'Foreign ID', 'Project ID', 'Party No', 'Main Identifier', 'ISWC', 'Tunecode', 'Copyright Date', 'Label Copy', 'Priority Work', 'Production Library Work', 'Category', 'Language', 'Composite Type', 'No. of Composite Works', 'Work Version', 'Arrangement Type', 'Lyric Adaption', 'Performers', 'Track ISRCs', 'Territories', 'Catalogue Groups', 'Aliases', 'Notes'],
        ['Leave blank if a new Work', 'Required', 'Used to display composers on statements, etc.', '', '', '', '', '', '', 'DD/MM/YYYY or MM/DD/YYYY as defined in your settings', '', 'TRUE or FALSE', 'TRUE or FALSE', 'Specific for CWR Category. Select from List', 'Select from List', 'Select from List', 'Only Required if Composite Type is Selected. A Number', 'Select from List', 'Only Required if Work Version is Modification. Select from List', 'Only Required if Work Version is Modification. Select from List', 'Separate multiple performers using a semi-colon (;)', 'Match tracks by their ISRC. Separated using a semi-colon (;) for multiple tracks', 'ISO2 Codes (see Reference tab), separated by a semi-colon (;), WW for World', 'Separate multiple groups using a semi-colon (;)', 'Separate multiple aliases using a semi-colon (;)', '']
    ],
    'Alternate Titles': [
        ['Work ID', 'Work Title', 'Work Main Identifier', 'Work Tunecode', 'Alternate Title', 'Language'],
        ['Fill in this or one of the following three cells to identify the work, depending on what information you have filled in on the main Works tab', '', '', '', '', 'Select from List']
    ],
    'Participators': [
        ['Work ID', 'Work Title', 'Work Main Identifier', 'Work Tunecode', 'Contract', 'Rate'],
        ['Fill in this or one of the following three cells to identify the work, depending on what information you have filled in on the main Works tab', '', '', '', 'Map the works to the contract by using the Contract Name', 'Contract Percentage, a number']
    ],
    'Specific Participation Rates': [
        ['Work ID', 'Work Title', 'Work Main Identifier', 'Work Tunecode', 'Contract', 'Distribution Channel', 'Source', 'Territory', 'Rate'],
        ['Fill in this or one of the following three cells to identify the work, depending on what information you have filled in on the main Works tab', '', '', '', 'Must match existing contract name in Curve exactly', 'Must match channel list set up in setting area', '', 'Must match territory ISO2 code or territory group name', 'A Number']
    ],
    'Society Identifiers': [
        ['Work ID', 'Work Title', 'Work Main Identifier', 'Work Tunecode', 'Society', 'Identifier'],
        ['Fill in this or one of the following three cells to identify the work, depending on what information you have filled in on the main Works tab', '', '', '', 'Name of the Society', 'Identifier for that specific society']
    ],
    'IP Chain': [
        ['Work ID', 'Work Title', 'Work Main Identifier', 'Work Tunecode', 'Territory', 'Participant 1 Type', 'Participant 1 Name', 'Participant 1 First Name', 'Participant 1 Middle Name', 'Participant 1 Surname', 'Participant 1 CAE Number', 'Participant 1 Controlled', 'Participant 1 Mechanical Owned', 'Participant 1 Mechanical Collected', 'Participant 1 Performance Owned', 'Participant 1 Performance Collected', 'Participant 1 Capacity', 'Participant 2 Type', 'Participant 2 Name', 'Participant 2 First Name', 'Participant 2 Middle Name', 'Participant 2 Surname', 'Participant 2 CAE Number', 'Participant 2 Controlled', 'Participant 2 Mechanical Owned', 'Participant 2 Mechanical Collected', 'Participant 2 Performance Owned', 'Participant 2 Performance Collected', 'Participant 2 Capacity', 'Participant 3 Type', 'Participant 3 Name', 'Participant 3 First Name', 'Participant 3 Middle Name', 'Participant 3 Surname', 'Participant 3 CAE Number', 'Participant 3 Controlled', 'Participant 3 Mechanical Owned', 'Participant 3 Mechanical Collected', 'Participant 3 Performance Owned', 'Participant 3 Performance Collected', 'Participant 3 Capacity', 'Participant 4 Type', 'Participant 4 Name', 'Participant 4 First Name', 'Participant 4 Middle Name', 'Participant 4 Surname', 'Participant 4 CAE Number', 'Participant 4 Controlled', 'Participant 4 Mechanical Owned', 'Participant 4 Mechanical Collected', 'Participant 4 Performance Owned', 'Participant 4 Performance Collected', 'Participant 4 Capacity', 'Participant 5 Type', 'Participant 5 Name', 'Participant 5 First Name', 'Participant 5 Middle Name', 'Participant 5 Surname', 'Participant 5 CAE Number', 'Participant 5 Controlled', 'Participant 5 Mechanical Owned', 'Participant 5 Mechanical Collected', 'Participant 5 Performance Owned', 'Participant 5 Performance Collected', 'Participant 5 Capacity', 'Participant 6 Type', 'Participant 6 Name', 'Participant 6 First Name', 'Participant 6 Middle Name', 'Participant 6 Surname', 'Participant 6 CAE Number', 'Participant 6 Controlled', 'Participant 6 Mechanical Owned', 'Participant 6 Mechanical Collected', 'Participant 6 Performance Owned', 'Participant 6 Performance Collected', 'Participant 6 Capacity', 'Participant 7 Type', 'Participant 7 Name', 'Participant 7 First Name', 'Participant 7 Middle Name', 'Participant 7 Surname', 'Participant 7 CAE Number', 'Participant 7 Controlled', 'Participant 7 Mechanical Owned', 'Participant 7 Mechanical Collected', 'Participant 7 Performance Owned', 'Participant 7 Performance Collected', 'Participant 7 Capacity', 'Participant 8 Type', 'Participant 8 Name', 'Participant 8 First Name', 'Participant 8 Middle Name', 'Participant 8 Surname', 'Participant 8 CAE Number', 'Participant 8 Controlled', 'Participant 8 Mechanical Owned', 'Participant 8 Mechanical Collected', 'Participant 8 Performance Owned', 'Participant 8 Performance Collected', 'Participant 8 Capacity', 'Participant 9 Type', 'Participant 9 Name', 'Participant 9 First Name', 'Participant 9 Middle Name', 'Participant 9 Surname', 'Participant 9 CAE Number', 'Participant 9 Controlled', 'Participant 9 Mechanical Owned', 'Participant 9 Mechanical Collected', 'Participant 9 Performance Owned', 'Participant 9 Performance Collected', 'Participant 9 Capacity', 'Participant 10 Type', 'Participant 10 Name', 'Participant 10 First Name', 'Participant 10 Middle Name', 'Participant 10 Surname', 'Participant 10 CAE Number', 'Participant 10 Controlled', 'Participant 10 Mechanical Owned', 'Participant 10 Mechanical Collected', 'Participant 10 Performance Owned', 'Participant 10 Performance Collected', 'Participant 10 Capacity'],
        ['Fill in this or one of the following three cells to identify the work, depending on what information you have filled in on the main Works tab', '', '', '', 'Must match existing Territory codes separated by ;', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '']
    ],
    'Partner IP Chains': [
        ['Work ID', 'Work Title', 'Work Main Identifier', 'Work Tunecode', 'Territory', 'Delivery Partner', 'Participant 1 Type', 'Participant 1 Name', 'Participant 1 First Name', 'Participant 1 Middle Name', 'Participant 1 Surname', 'Participant 1 CAE Number', 'Participant 1 Controlled', 'Participant 1 Mechanical Owned', 'Participant 1 Mechanical Collected', 'Participant 1 Performance Owned', 'Participant 1 Performance Collected', 'Participant 1 Capacity', 'Participant 2 Type', 'Participant 2 Name', 'Participant 2 First Name', 'Participant 2 Middle Name', 'Participant 2 Surname', 'Participant 2 CAE Number', 'Participant 2 Controlled', 'Participant 2 Mechanical Owned', 'Participant 2 Mechanical Collected', 'Participant 2 Performance Owned', 'Participant 2 Performance Collected', 'Participant 2 Capacity', 'Participant 3 Type', 'Participant 3 Name', 'Participant 3 First Name', 'Participant 3 Middle Name', 'Participant 3 Surname', 'Participant 3 CAE Number', 'Participant 3 Controlled', 'Participant 3 Mechanical Owned', 'Participant 3 Mechanical Collected', 'Participant 3 Performance Owned', 'Participant 3 Performance Collected', 'Participant 3 Capacity', 'Participant 4 Type', 'Participant 4 Name', 'Participant 4 First Name', 'Participant 4 Middle Name', 'Participant 4 Surname', 'Participant 4 CAE Number', 'Participant 4 Controlled', 'Participant 4 Mechanical Owned', 'Participant 4 Mechanical Collected', 'Participant 4 Performance Owned', 'Participant 4 Performance Collected', 'Participant 4 Capacity', 'Participant 5 Type', 'Participant 5 Name', 'Participant 5 First Name', 'Participant 5 Middle Name', 'Participant 5 Surname', 'Participant 5 CAE Number', 'Participant 5 Controlled', 'Participant 5 Mechanical Owned', 'Participant 5 Mechanical Collected', 'Participant 5 Performance Owned', 'Participant 5 Performance Collected', 'Participant 5 Capacity', 'Participant 6 Type', 'Participant 6 Name', 'Participant 6 First Name', 'Participant 6 Middle Name', 'Participant 6 Surname', 'Participant 6 CAE Number', 'Participant 6 Controlled', 'Participant 6 Mechanical Owned', 'Participant 6 Mechanical Collected', 'Participant 6 Performance Owned', 'Participant 6 Performance Collected', 'Participant 6 Capacity', 'Participant 7 Type', 'Participant 7 Name', 'Participant 7 First Name', 'Participant 7 Middle Name', 'Participant 7 Surname', 'Participant 7 CAE Number', 'Participant 7 Controlled', 'Participant 7 Mechanical Owned', 'Participant 7 Mechanical Collected', 'Participant 7 Performance Owned', 'Participant 7 Performance Collected', 'Participant 7 Capacity', 'Participant 8 Type', 'Participant 8 Name', 'Participant 8 First Name', 'Participant 8 Middle Name', 'Participant 8 Surname', 'Participant 8 CAE Number', 'Participant 8 Controlled', 'Participant 8 Mechanical Owned', 'Participant 8 Mechanical Collected', 'Participant 8 Performance Owned', 'Participant 8 Performance Collected', 'Participant 8 Capacity', 'Participant 9 Type', 'Participant 9 Name', 'Participant 9 First Name', 'Participant 9 Middle Name', 'Participant 9 Surname', 'Participant 9 CAE Number', 'Participant 9 Controlled', 'Participant 9 Mechanical Owned', 'Participant 9 Mechanical Collected', 'Participant 9 Performance Owned', 'Participant 9 Performance Collected', 'Participant 9 Capacity', 'Participant 10 Type', 'Participant 10 Name', 'Participant 10 First Name', 'Participant 10 Middle Name', 'Participant 10 Surname', 'Participant 10 CAE Number', 'Participant 10 Controlled', 'Participant 10 Mechanical Owned', 'Participant 10 Mechanical Collected', 'Participant 10 Performance Owned', 'Participant 10 Performance Collected', 'Participant 10 Capacity'],
        ['Fill in this or one of the following three cells to identify the work, depending on what information you have filled in on the main Works tab', '', '', '', 'Must match existing Territory codes separated by ;', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '', 'Composer or Publisher', 'Required', 'Leave first, middle and surnames blank for publishers', '', '', '', 'TRUE or FALSE', '', '', '', '', '']
    ],
    'Reference': [
        ['AD', 'Andorra', '', 'TRUE', 'Pop', 'English', 'None', 'Original Work', 'Original', 'Original', 'Composer', 'Original Publisher'],
        ['AE', 'United Arab Emirates', '', 'FALSE', 'Jazz', 'Assamese', 'Composite of Samples', 'Modification', 'New Music Added', 'None', 'Publisher', 'Sub Publisher'],
        ['AF', 'Afghanistan', '', '', 'Classical', 'Aymara', 'Medley', '', 'Arrangement', 'New Lyrics Added', '', 'Admin'],
        ['AG', 'Antigua and Barbuda', '', '', 'Undefined', 'Azerbaijani', 'Potpourri', '', 'Addition of Music to Text', 'Modification', '', 'Acquirer'],
        ['AL', 'Albania', '', '', '', 'Bashkir', 'Unspecified', '', 'Unspecified', 'Replaced', '', 'Lyrics and Music'],
        ['AM', 'Armenia', '', '', '', 'Basque', '', '', '', 'Addition of Lyrics to Music', '', 'Lyrics'],
        ['AO', 'Angola', '', '', '', 'Bengali', '', '', '', 'Translation', '', 'Music'],
        ['AR', 'Argentina', '', '', '', 'Bhutani', '', '', '', 'Unspecified', 'Arranger'],
        ['AT', 'Austria', '', '', '', 'Bihari', '', '', '', '', '', 'Sub Arranger'],
        ['AU', 'Australia', '', '', '', 'Bislama', '', '', '', '', '', 'Adapter'],
        ['AZ', 'Azerbaijan', '', '', '', 'Breton', '', '', '', '', '', 'Sub Author'],
        ['BA', 'Bosnia and Herzegovina', '', '', '', 'Bulgarian', '', '', '', '', '', 'Translator'],
        ['BB', 'Barbados', '', '', '', 'Burmese', '', '', '', '', '', 'Income Participant'],
        ['BD', 'Bangladesh', '', '', '', 'Byelorussian'],
        ['BE', 'Belgium', '', '', '', 'Cambodian'],
        ['BF', 'Burkina Faso', '', '', '', 'Catalan'],
        ['BG', 'Bulgaria', '', '', '', 'Chinese'],
        ['BH', 'Bahrain', '', '', '', 'Corsican'],
        ['BI', 'Burundi', '', '', '', 'Croatian'],
        ['BJ', 'Benin', '', '', '', 'Czech'],
        ['BN', 'Brunei Darussalam', '', '', '', 'Danish'],
        ['BO', 'Bolivia', '', '', '', 'Dutch'],
        ['BR', 'Brazil', '', '', '', 'Esperanto'],
        ['BS', 'Bahamas', '', '', '', 'Estonian'],
        ['BT', 'Bhutan', '', '', '', 'Faroese'],
        ['BW', 'Botswana', '', '', '', 'Farsi'],
        ['BY', 'Belarus', '', '', '', 'Fiji'],
        ['BZ', 'Belize', '', '', '', 'Finnish'],
        ['CA', 'Canada', '', '', '', 'French'],
        ['CD', 'Congo, The Democratic Republic Of The', '', '', '', 'Frisian'],
        ['CF', 'Central African Republic', '', '', '', 'Galician'],
        ['CG', 'Congo', '', '', '', 'Georgian'],
        ['CH', 'Switzerland', '', '', '', 'German'],
        ['CI', "Cote d'Ivoire", '', '', '', 'Greek'],
        ['CL', 'Chile', '', '', '', 'Greenlandic'],
        ['CM', 'Cameroon', '', '', '', 'Guarani'],
        ['CN', 'China', '', '', '', 'Gujarati'],
        ['CO', 'Colombia', '', '', '', 'Hausa'],
        ['CR', 'Costa Rica', '', '', '', 'Hawaii'],
        ['CU', 'Cuba', '', '', '', 'Hebrew'],
        ['CV', 'Cape Verde', '', '', '', 'Hindi'],
        ['CY', 'Cyprus', '', '', '', 'Hungarian'],
        ['CZ', 'Czech Republic', '', '', '', 'Icelandic'],
        ['DE', 'Germany', '', '', '', 'Indonesian'],
        ['DJ', 'Djibouti', '', '', '', 'Interlingua'],
        ['DK', 'Denmark', '', '', '', 'Interlingue'],
        ['DM', 'Dominica', '', '', '', 'Inupiak'],
        ['DO', 'Dominican Republic', '', '', '', 'Irish'],
        ['DZ', 'Algeria', '', '', '', 'Italian'],
        ['EC', 'Ecuador', '', '', '', 'Japanese'],
        ['EE', 'Estonia', '', '', '', 'Javanese'],
        ['EG', 'Egypt', '', '', '', 'Kannada'],
        ['EH', 'Western Sahara', '', '', '', 'Kashmiri'],
        ['ER', 'Eritrea', '', '', '', 'Kazakh'],
        ['ES', 'Spain', '', '', '', 'Kinyarwanda'],
        ['ET', 'Ethiopia', '', '', '', 'Kirghiz'],
        ['FI', 'Finland', '', '', '', 'Kirundi'],
        ['FJ', 'Fiji', '', '', '', 'Korean'],
        ['FM', 'Micronesia, Federated States of', '', '', '', 'Kurdish'],
        ['FR', 'France', '', '', '', 'Laothian'],
        ['GA', 'Gabon', '', '', '', 'Latin'],
        ['GB', 'United Kingdom', '', '', '', 'Latvian'],
        ['GD', 'Grenada', '', '', '', 'Lingala'],
        ['GE', 'Georgia', '', '', '', 'Lithuanian'],
        ['GH', 'Ghana', '', '', '', 'Macedonian'],
        ['GM', 'Gambia', '', '', '', 'Malagasy'],
        ['GN', 'Guinea', '', '', '', 'Malay'],
        ['GQ', 'Equatorial Guinea', '', '', '', 'Malayalam'],
        ['GR', 'Greece', '', '', '', 'Maltese'],
        ['GT', 'Guatemala', '', '', '', 'Maori'],
        ['GW', 'Guinea-bissau', '', '', '', 'Marathi'],
        ['GY', 'Guyana', '', '', '', 'Moldavian'],
        ['HK', 'Hong Kong', '', '', '', 'Mongolian'],
        ['HN', 'Honduras', '', '', '', 'Nauru'],
        ['HR', 'Croatia', '', '', '', 'Ndebele'],
        ['HT', 'Haiti', '', '', '', 'Nepali'],
        ['HU', 'Hungary', '', '', '', 'North Sotho'],
        ['ID', 'Indonesia', '', '', '', 'Norwegian'],
        ['IE', 'Ireland', '', '', '', 'Occitan'],
        ['IL', 'Israel', '', '', '', 'Oriya'],
        ['IN', 'India', '', '', '', 'Oromo'],
        ['IQ', 'Iraq', '', '', '', 'Papiamento'],
        ['IR', 'Iran, Islamic Republic Of', '', '', '', 'Pashto'],
        ['IS', 'Iceland', '', '', '', 'Polish'],
        ['IT', 'Italy', '', '', '', 'Portuguese'],
        ['JM', 'Jamaica', '', '', '', 'Punjabi'],
        ['JO', 'Jordan', '', '', '', 'Quechua'],
        ['JP', 'Japan', '', '', '', 'Rhaeto-Romance'],
        ['KE', 'Kenya', '', '', '', 'Romanian'],
        ['KG', 'Kyrgyzstan', '', '', '', 'Russian'],
        ['KH', 'Cambodia', '', '', '', 'Samoan'],
        ['KI', 'Kiribati', '', '', '', 'Sangro'],
        ['KM', 'Comoros', '', '', '', 'Sanskrit'],
        ['KN', 'Saint Kitts and Nevis', '', '', '', 'Scots Gaelic'],
        ['KP', "Korea, Democratic People's Republic Of", '', '', '', 'Serbian'],
        ['KR', 'Korea, Republic Of', '', '', '', 'Serbo-Croatian'],
        ['KW', 'Kuwait', '', '', '', 'Sesotho'],
        ['KZ', 'Kazakhstan', '', '', '', 'Setswana'],
        ['LA', "Lao People's Democratic Republic", '', '', '', 'Shona'],
        ['LB', 'Lebanon', '', '', '', 'Sindhi'],
        ['LC', 'Saint Lucia', '', '', '', 'Singhalese'],
        ['LI', 'Liechtenstein', '', '', '', 'Siswati'],
        ['LK', 'Sri Lanka', '', '', '', 'Slovak'],
        ['LR', 'Liberia', '', '', '', 'Slovenian'],
        ['LS', 'Lesotho', '', '', '', 'Somali'],
        ['LT', 'Lithuania', '', '', '', 'Spanish'],
        ['LU', 'Luxembourg', '', '', '', 'Sudanese'],
        ['LV', 'Latvia', '', '', '', 'Swahili'],
        ['LY', 'Libya', '', '', '', 'Swedish'],
        ['MA', 'Morocco', '', '', '', 'Tagalog'],
        ['MC', 'Monaco', '', '', '', 'Tajik'],
        ['MD', 'Moldova, Republic Of', '', '', '', 'Tamil'],
        ['ME', 'Montenegro', '', '', '', 'Tatar'],
        ['MG', 'Madagascar', '', '', '', 'Telugu'],
        ['MH', 'Marshall Islands', '', '', '', 'Thai'],
        ['MK', 'North Macedonia', '', '', '', 'Tibetan'],
        ['ML', 'Mali', '', '', '', 'Tigrinya'],
        ['MM', 'Myanmar', '', '', '', 'Tonga'],
        ['MN', 'Mongolia', '', '', '', 'Tsonga'],
        ['MO', 'Macao', '', '', '', 'Turkish'],
        ['MR', 'Mauritania', '', '', '', 'Turkmen'],
        ['MT', 'Malta', '', '', '', 'Twi'],
        ['MU', 'Mauritius', '', '', '', 'Ukrainian'],
        ['MV', 'Maldives', '', '', '', 'Urdu'],
        ['MW', 'Malawi', '', '', '', 'Uzbek'],
        ['MX', 'Mexico', '', '', '', 'Venda'],
        ['MY', 'Malaysia', '', '', '', 'Vietnamese'],
        ['MZ', 'Mozambique', '', '', '', 'Volapuk'],
        ['NA', 'Namibia', '', '', '', 'Welsh'],
        ['NC', 'New Caledonia', '', '', '', 'Wolof'],
        ['NE', 'Niger', '', '', '', 'Xhosa'],
        ['NG', 'Nigeria', '', '', '', 'Yiddish'],
        ['NI', 'Nicaragua', '', '', '', 'Yoruba'],
        ['NL', 'Netherlands', '', '', '', 'Zu'],
        ['NO', 'Norway', '', '', '', 'Zulu'],
        ['NP', 'Nepal'],
        ['NR', 'Nauru'],
        ['NZ', 'New Zealand'],
        ['OM', 'Oman'],
        ['PA', 'Panama'],
        ['PE', 'Peru'],
        ['PF', 'French Polynesia'],
        ['PG', 'Papua New Guinea'],
        ['PH', 'Philippines'],
        ['PK', 'Pakistan'],
        ['PL', 'Poland'],
        ['PR', 'Puerto Rico'],
        ['PT', 'Portugal'],
        ['PW', 'Palau'],
        ['PY', 'Paraguay'],
        ['QA', 'Qatar'],
        ['RO', 'Romania'],
        ['RS', 'Serbia'],
        ['RU', 'Russian Federation'],
        ['RW', 'Rwanda'],
        ['SA', 'Saudi Arabia'],
        ['SB', 'Solomon Islands'],
        ['SC', 'Seychelles'],
        ['SD', 'Sudan'],
        ['SE', 'Sweden'],
        ['SG', 'Singapore'],
        ['SI', 'Slovenia'],
        ['SK', 'Slovakia'],
        ['SL', 'Sierra Leone'],
        ['SM', 'San Marino'],
        ['SN', 'Senegal'],
        ['SO', 'Somalia'],
        ['SR', 'Suriname'],
        ['SS', 'South Sudan'],
        ['ST', 'Sao Tome and Principe'],
        ['SV', 'El Salvador'],
        ['SY', 'Syrian Arab Republic'],
        ['SZ', 'Eswatini'],
        ['TD', 'Chad'],
        ['TG', 'Togo'],
        ['TH', 'Thailand'],
        ['TJ', 'Tajikistan'],
        ['TL', 'Timor-Leste'],
        ['TM', 'Turkmenistan'],
        ['TN', 'Tunisia'],
        ['TO', 'Tonga'],
        ['TR', 'Turkey'],
        ['TT', 'Trinidad and Tobago'],
        ['TV', 'Tuvalu'],
        ['TW', 'Taiwan, Province Of China'],
        ['TZ', 'Tanzania, United Republic Of'],
        ['UA', 'Ukraine'],
        ['UG', 'Uganda'],
        ['US', 'United States'],
        ['UY', 'Uruguay'],
        ['UZ', 'Uzbekistan'],
        ['VA', 'Holy See (Vatican City State)'],
        ['VC', 'Saint Vincent and the Grenadines'],
        ['VE', 'Venezuela'],
        ['VN', 'Viet Nam'],
        ['VU', 'Vanuatu'],
        ['WS', 'Samoa'],
        ['YE', 'Yemen'],
        ['ZA', 'South Africa'],
        ['ZM', 'Zambia'],
        ['ZW', 'Zimbabwe']
    ]
};

export async function createTrackSheet() {
    const authClient = await getUserAuth(); // мой gmail
    const drive  = google.drive({version: 'v3', auth: authClient});
    const sheets = google.sheets({version: 'v4', auth: authClient});

    const createResp = await drive.files.create({
        requestBody: {
            name: 'TR TEST',
            mimeType: 'application/vnd.google-apps.spreadsheet'
        },
        fields: 'id'
    });
    const spreadsheetId = createResp.data.id;

    const sheetTitles = Object.keys(TEMPLATE_TR);
    const requests = [];

    requests.push({ updateSheetProperties: {
            properties: { sheetId: 0, title: sheetTitles[0] },
            fields: 'title'
        }});

    for (let i = 1; i < sheetTitles.length; i++) {
        requests.push({ addSheet: { properties: { title: sheetTitles[i] } } });
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests }
    });

    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
            valueInputOption: 'RAW',
            data: sheetTitles.map(title => ({
                range: `'${title}'!A1`,
                values: TEMPLATE_TR[title]
            }))
        }
    });

    const meta = await sheets.spreadsheets.get({ spreadsheetId });

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: (meta.data.sheets || [])
                .filter(el => sheetTitles.includes(el.properties.title) && el.properties.title !== 'Reference')
                .flatMap(el => {
                    return [
                        {
                        updateDimensionProperties: {
                            range: {
                                sheetId: el.properties.sheetId,
                                dimension: 'ROWS',
                                startIndex: 0, // строка 1
                                endIndex: 2 // строка 2
                            },
                            properties: { pixelSize: 100 }, // высота
                            fields: 'pixelSize'
                        }
                        },
                        {
                        updateDimensionProperties: {
                            range: {
                                sheetId: el.properties.sheetId,
                                dimension: 'COLUMNS',
                                startIndex: 0, // колонка A
                                endIndex: TEMPLATE_TR[el.properties.title][0].length // до последней колонки шаблона
                            },
                            properties: { pixelSize: 300 }, // ширина
                            fields: 'pixelSize'
                        }
                        }
                    ];
                })
        }
    });

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: (meta.data.sheets || [])
                .filter(el => sheetTitles.includes(el.properties.title) && el.properties.title !== 'Reference')
                .map(el => ({
                    repeatCell: {
                        range: {
                            sheetId: el.properties.sheetId,
                            startRowIndex: 0,
                            endRowIndex: TEMPLATE_TR[el.properties.title].length,
                            startColumnIndex: 0,
                            endColumnIndex: TEMPLATE_TR[el.properties.title][0].length
                        },
                        cell: {
                            userEnteredFormat: {
                                horizontalAlignment: 'CENTER',
                                verticalAlignment: 'MIDDLE',
                                wrapStrategy: 'WRAP'
                            }
                        },
                        fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,wrapStrategy)'
                    }
                }))
        }
    });

    await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: { type: 'anyone', role: 'writer' }
    });

    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}





export async function createWorksSheet() {
    const authClient = await getUserAuth(); // мой gmail
    const drive  = google.drive({version: 'v3', auth: authClient});
    const sheets = google.sheets({version: 'v4', auth: authClient});

    //создаем таблицу (пустую)
    const createResp = await drive.files.create({
        requestBody: {
            name: 'WR TEST',
            mimeType: 'application/vnd.google-apps.spreadsheet',
        },
        fields: 'id'
    });

    const spreadsheetId = createResp.data.id;

    //делаем массив из названий листов
    const sheetTitles = Object.keys(TEMPLATE_WR);
    const requests = [];

    //переименовываем первый лист потому что он у нас автоматически создается как Sheet1
    requests.push({ updateSheetProperties: {
            properties: { sheetId: 0, title: sheetTitles[0] },
            fields: 'title'
        }});

    //создаем остальные листы не считая первый Works
    for (let i = 1; i < sheetTitles.length; i++) {
        requests.push({ addSheet: { properties: { title: sheetTitles[i] } } });
    }

    //отправляем запросы на переименование и создание новых листов
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests }
    });

    //заполняем созданные листы по шаблону
    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
            valueInputOption: 'RAW', // разобраться че еще есть кроме RAW
            data: sheetTitles.map(title => ({
                range: `'${title}'!A1`,
                values: TEMPLATE_WR[title]
            }))
        }
    });

    //получаем инфу о таблице, чтобы подогнать размеры для колонок
    const meta = await sheets.spreadsheets.get({ spreadsheetId });


    //задаем высоту строк и ширину столбцов для всех листов кроме листа Reference
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: (meta.data.sheets || [])
                .filter(el => sheetTitles.includes(el.properties.title) && el.properties.title !== 'Reference')
                .flatMap(el => {
                    return [
                        {
                            updateDimensionProperties: {
                                range: {
                                    sheetId: el.properties.sheetId,
                                    dimension: 'ROWS',
                                    startIndex: 0,
                                    endIndex: 2
                                },
                                properties: { pixelSize: 100 },
                                fields: 'pixelSize'
                            }
                        },
                        {
                            updateDimensionProperties: {
                                range: {
                                    sheetId: el.properties.sheetId,
                                    dimension: 'COLUMNS',
                                    startIndex: 0,
                                    endIndex: TEMPLATE_WR[el.properties.title][0].length
                                },
                                properties: { pixelSize: 200 },
                                fields: 'pixelSize'
                            }
                        }
                    ];
                })
        }
    });

    //выравниваем текст в ячейках по центру и не даем ему уползать
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: (meta.data.sheets || [])
                .filter(el => sheetTitles.includes(el.properties.title) && el.properties.title !== 'Reference')
                .map(el => ({
                    repeatCell: {
                        range: {
                            sheetId: el.properties.sheetId,
                            startRowIndex: 0,
                            endRowIndex: TEMPLATE_WR[el.properties.title].length,
                            startColumnIndex: 0,
                            endColumnIndex: TEMPLATE_WR[el.properties.title][0].length
                        },
                        cell: {
                            userEnteredFormat: {
                                horizontalAlignment: 'CENTER',
                                verticalAlignment: 'MIDDLE',
                                wrapStrategy: 'WRAP'
                            }
                        },
                        fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,wrapStrategy)'
                    }
                }))
        }
    });

    //делаем таблицу общедоступной для редактирования
    await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: { type: 'anyone', role: 'writer' }
    });


    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}
