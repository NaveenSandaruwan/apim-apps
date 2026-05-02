/**
 * Utility helpers for ruleset YAML generation and parsing.
 */
export function buildExternalYaml(values) {
    const lines = [];
    lines.push(`name: ${values.name || 'tool-poisoning-detection'}`);
    lines.push(`description: |\n  ${values.topDescription || ''}`);
    lines.push('ruleCategory: EXTERNAL');
    lines.push('ruleType: API_DEFINITION');
    lines.push('artifactType: MCP');
    lines.push(`documentationLink: "${values.documentationLink || '<service-documentation-link>'}"`);
    lines.push(`provider: ${values.provider || 'WSO2'}`);
    lines.push('rulesetContent:');
    lines.push('  rules:');
    lines.push(`    ${values.ruleKey || 'description-poisoning-detection'}:`);
    if (values.targetPath) lines.push(`      targetPath: "${values.targetPath}"`);
    if (values.severity) lines.push(`      severity: ${values.severity.toLowerCase()}`);
    lines.push('      payload:');
    if (values.payloadMethod || values.payloadContentPath) {
        lines.push(`        method: ${values.payloadMethod || 'POST'}`);
        if (values.payloadContentPath) {
            lines.push(`        contentPath: "${values.payloadContentPath}"`);
        }
        if (values.template) {
            lines.push('        template:');
            values.template.split('\n').forEach((t) => {
                lines.push(`          - ${t}`);
            });
        }
    }
    if (values.responseResultPath || values.responseExpectedValue) {
        lines.push('      response:');
        if (values.responseResultPath) {
            lines.push(`        resultPath: "${values.responseResultPath}"`);
        }
        if (values.responseExpectedValue) {
            lines.push(`        expectedValue: ${values.responseExpectedValue}`);
        }
    }
    if (values.serviceRef) lines.push(`      serviceRef: "${values.serviceRef}"`);
    if (values.ruleDescription) {
        lines.push('      description: >-\n        ' + values.ruleDescription.replace(/\n/g, '\n        '));
    }
    if (values.message) {
        lines.push('      message: >-\n        ' + values.message.replace(/\n/g, '\n        '));
    }
    lines.push(`      resolved: ${values.resolved ? 'true' : 'false'}`);
    if (values.formats) {
        lines.push('      formats:');
        values.formats.split(',').map((f) => f.trim()).filter(Boolean).forEach((f) => {
            lines.push(`        - ${f}`);
        });
    }

    return lines.join('\n');
}

export default {
    buildExternalYaml,
};
