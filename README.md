# documents
documents is a modular toolset for targeting output of documents in pdf or docx formats

## Requirements

- NodeJS > 8.9.0
- (docx support) Pandoc

## TODO

- [ ] add cli command
- [ ] documentation
- [ ] allow adjusting the render viewport
- [ ] enable pandoc - docx loading of dot templates
- [ ] optimize loading puppeteer between components
- [ ] remove plugins from core into seperate libs?
- [ ] move content renderers outside into seperate packages?
- [ ] seperate tag parser out of bpmn plugin back into core
- [ ] allow inline content for plugins
- [ ] enable page breaks in pandoc-docx
- [ ] stop plugins from renderering the same file multiple times in one render
- [ ] offline renderering - move any external content to internal
- Plugins 
  - [x] BPNM - https://bpmn.io/toolkit/bpmn-js/
  - [ ] DMN - https://bpmn.io/toolkit/dmn-js/
  - [ ] CMMN - https://bpmn.io/toolkit/cmmn-js/
  - [ ] custom inline js rendering e.g. d3, charts.js?