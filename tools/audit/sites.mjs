// The sites the audit covers, with one page of each kind. Folders are
// relative to the public-works parent folder, or to AUDIT_SUITE when set.
// Detail pages carry a real ID from the site's own data.

import path from 'node:path';

export const SUITE = process.env.AUDIT_SUITE || path.resolve(import.meta.dirname, '../../..');

export const SITES = [
  {
    id: 'paygap', name: 'The Pay Gap', root: 'paygap.publicworks.nyc/docs', port: 4401,
    pages: [
      ['/', 'home'], ['/lookup.html?title=police-officer', 'tool'], ['/lookup.html?scope=agency', 'tool'],
      ['/citywide.html', 'tool'], ['/compare.html', 'tool'],
      ['/data.html', 'data'], ['/about.html', 'about'], ['/missing-page', '404'],
    ],
  },
  {
    id: 'hazardhistorian', name: 'NYC Hazard Historian', root: 'hazardhistorian.publicworks.nyc/docs', port: 4402,
    pages: [
      ['/', 'home'], ['/explore.html', 'tool'], ['/event.html?id=E20211016-163389', 'tool'],
      ['/compare.html', 'tool'], ['/dataflow.html', 'tool'],
      ['/data.html', 'data'], ['/about.html', 'about'], ['/missing-page', '404'],
    ],
  },
  {
    id: 'schools', name: 'Schools Finder', root: 'schools.publicworks.nyc/docs', port: 4403,
    pages: [
      ['/', 'home'], ['/browse.html', 'tool'], ['/school.html?dbn=01M015', 'tool'],
      ['/school.html?dbn=02M475', 'tool'], ['/compare.html?schools=01M015,02M475', 'tool'],
      ['/data.html', 'data'], ['/about.html', 'about'], ['/missing-page', '404'],
    ],
  },
  {
    id: 'civilservice', name: 'NYC Civil Service Exams', root: 'civilservice.publicworks.nyc/docs', port: 4404,
    pages: [
      ['/', 'home'], ['/exam.html?exam=6311', 'tool'], ['/titles.html', 'tool'],
      ['/title.html?title=accountant-40510', 'tool'], ['/how-to-apply.html', 'tool'],
      ['/data.html', 'data'], ['/about.html', 'about'], ['/missing-page', '404'],
    ],
  },
  {
    id: 'bluepages', name: 'The Blue Pages', root: 'bluepages.publicworks.nyc/docs', port: 4405,
    pages: [
      ['/', 'home'], ['/?a=administration-for-children-s-services', 'tool'], ['/?view=chart', 'tool'],
      ['/?view=quiz', 'tool'], ['/?view=data', 'data'], ['/?view=about', 'about'], ['/missing-page', '404'],
    ],
  },
  {
    id: 'wealth', name: 'Wealth NYC', root: 'wealth.publicworks.nyc/docs', port: 4406,
    pages: [['/', 'home'], ['/data.html', 'data'], ['/about.html', 'about'], ['/missing-page', '404']],
  },
  {
    id: 'wealthnj', name: 'Wealth NJ', root: 'wealthnj.publicworks.nyc/docs', port: 4407,
    pages: [['/', 'home'], ['/data.html', 'data'], ['/about.html', 'about'], ['/missing-page', '404']],
  },
  {
    id: 'choppernoise', name: 'Chopper Noise', root: 'helicopters.publicworks.nyc/docs', port: 4408,
    pages: [['/', 'home'], ['/data.html', 'data'], ['/about.html', 'about'], ['/missing-page', '404']],
  },
  {
    id: 'portfolio', name: 'publicworks.nyc', root: 'publicworks.nyc/dist', port: 4409, portfolio: true,
    pages: [['/', 'home'], ['/missing-page', '404']],
  },
  {
    id: 'cidadelabs', name: 'Cidade Labs', root: 'publicworks.nyc/dist-cidadelabs', port: 4410, portfolio: true,
    pages: [
      ['/', 'home'], ['/es/', 'home'], ['/en/', 'home'], ['/blog/why-a-civic-lab/', 'tool'],
      ['/missing-page', '404'],
    ],
  },
].map(s => ({ ...s, root: path.join(SUITE, s.root) }));
