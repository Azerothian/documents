
import Puppet from "../puppet";
import bpmnPuppetPlugin from "../puppet/plugins/bpmn";
export default class PuppetPlugin {
  constructor(options) {
    this.options = options;
  }
  async init(md) {
    this.puppet = new Puppet({
      // renderFile: this.options.renderFile,
      // sourceDir: this.options.source.dir,
      // workingDir: this.options.target.dir,
      workingDir: this.options.source.dir,
      relativeDir: this.options.target.dir,
      outputDir: this.options.target.contentDir,
      plugins: [bpmnPuppetPlugin],
    });
    await this.puppet.initialize();
    md.use(this.puppet.register(), {});
  }
  after(contents) {
    return this.puppet.render();
  }
  end() {
    return this.puppet.close();
  }
}
