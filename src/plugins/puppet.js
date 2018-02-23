
import Puppet from "../puppet";
import bpmnPuppetPlugin from "../puppet/plugins/bpmn";
export default class PuppetPlugin {
  constructor(options) {
    this.options = options;
  }
  async init(md) {
    this.puppet = new Puppet({
      cwd: this.options.sourceDir,
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
