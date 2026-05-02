/*
 * ExternalRulesetForm - form for EXTERNAL rulesets (MCP / API_DEFINITION)
 */
import React, {
    useState,
    useEffect,
    useCallback,
} from 'react';
import { useIntl } from 'react-intl';
import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Switch,
    Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import CONSTS from 'AppData/Constants';
import { buildExternalYaml } from './rulesetYamlUtils';

// YAML generation moved to rulesetYamlUtils.buildExternalYaml

function ExternalRulesetForm({
    rulesetContent,
    onContentChange,
    serviceRef,
    onServiceRefChange,
}) {
    const intl = useIntl();

    const formatMessage = (id, defaultMessage) => intl.formatMessage({
        id,
        defaultMessage,
    });

    const defaultValues = {
        name: 'tool-poisoning-detection',
        topDescription: (
            'The set of rules to detect tool definitions that are vulnerable to '
            + 'tool poisoning attacks.'
        ),
        ruleKey: 'description-poisoning-detection',
        targetPath: '$.data.operations[*]',
        severity: 'ERROR',
        payloadMethod: 'POST',
        payloadContentPath: '$.description',
        template: 'description: "{{value}}"',
        responseResultPath: '$[0].is_poisoned',
        responseExpectedValue: 'true',
        serviceRef: '56fcb04a-5ed9-4e03-b1f4-ee93afc82ff2',
        ruleDescription: (
            'Tool descriptions in MCP server definitions can be exploited through '
            + 'tool poisoning attacks, where malicious or hidden instructions are '
            + 'embedded to manipulate AI agent behavior. Tool descriptions must '
            + 'not contain prompt injection attempts, hidden directives, or '
            + 'instructions that override user intentions.'
        ),
        message: (
            "Tool '{{target}}' description may contain poisoning content. Remove "
            + 'hidden instructions or prompt-injection text.'
        ),
        resolved: true,
        formats: 'mcp_definition',
        documentationLink: '<service-documentation-link>',
        provider: 'WSO2',
    };

    const [values, setValues] = useState(defaultValues);

    // If incoming content exists, prefer it (don't parse deeply, just forward it)
    useEffect(() => {
        if (rulesetContent && rulesetContent.trim()) {
            // If external YAML already provided, forward unchanged
            onContentChange(rulesetContent);
        } else {
            const yaml = buildExternalYaml(values);
            onContentChange(yaml);
        }
    }, []);

    // Sync serviceRef prop from parent into local state when it changes
    useEffect(() => {
        if (serviceRef !== undefined && serviceRef !== values.serviceRef) {
            setValues((prev) => {
                const next = { ...prev, serviceRef: serviceRef || '' };
                const yaml = buildExternalYaml(next);
                onContentChange(yaml);
                return next;
            });
        }
    }, [serviceRef]);

    const update = useCallback((field, v) => {
        setValues((prev) => {
            const next = { ...prev, [field]: v };
            const yaml = buildExternalYaml(next);
            onContentChange(yaml);
            // If the serviceRef field changed, notify parent so it can update selection
            if (field === 'serviceRef' && typeof onServiceRefChange === 'function') {
                onServiceRefChange(v);
            }
            return next;
        });
    }, [onContentChange, onServiceRefChange]);

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.name',
                            'Rule Name',
                        )}
                        value={values.name}
                        onChange={(e) => update('name', e.target.value)}
                        size='small'
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.severity',
                            'Severity',
                        )}
                        value={values.severity}
                        onChange={(e) => update('severity', e.target.value)}
                        size='small'
                    >
                        {CONSTS.SEVERITY_LEVELS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.targetPath',
                            'Target Path',
                        )}
                        value={values.targetPath}
                        onChange={(e) => update('targetPath', e.target.value)}
                        size='small'
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.payloadMethod',
                            'Payload Method',
                        )}
                        value={values.payloadMethod}
                        onChange={(e) => update('payloadMethod', e.target.value)}
                        size='small'
                    >
                        <MenuItem value='POST'>POST</MenuItem>
                        <MenuItem value='GET'>GET</MenuItem>
                        <MenuItem value='PUT'>PUT</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.contentPath',
                            'Payload Content Path',
                        )}
                        value={values.payloadContentPath}
                        onChange={(e) => update('payloadContentPath', e.target.value)}
                        size='small'
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={formatMessage(
                            'Governance.Rulesets.External.template',
                            'Template (one item per line)',
                        )}
                        value={values.template}
                        onChange={(e) => update('template', e.target.value)}
                        size='small'
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.responseResultPath',
                            'Response Result Path',
                        )}
                        value={values.responseResultPath}
                        onChange={(e) => update('responseResultPath', e.target.value)}
                        size='small'
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.expectedValue',
                            'Expected Value',
                        )}
                        value={values.responseExpectedValue}
                        onChange={(e) => update('responseExpectedValue', e.target.value)}
                        size='small'
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.serviceRef',
                            'Service Reference',
                        )}
                        value={values.serviceRef}
                        onChange={(e) => update('serviceRef', e.target.value)}
                        size='small'
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={formatMessage(
                            'Governance.Rulesets.External.ruleDescription',
                            'Rule Description',
                        )}
                        value={values.ruleDescription}
                        onChange={(e) => update('ruleDescription', e.target.value)}
                        size='small'
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label={formatMessage(
                            'Governance.Rulesets.External.message',
                            'Message',
                        )}
                        value={values.message}
                        onChange={(e) => update('message', e.target.value)}
                        size='small'
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.formats',
                            'Formats (comma separated)',
                        )}
                        value={values.formats}
                        onChange={(e) => update('formats', e.target.value)}
                        size='small'
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <TextField
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.documentationLink',
                            'Documentation Link',
                        )}
                        value={values.documentationLink}
                        onChange={(e) => update('documentationLink', e.target.value)}
                        size='small'
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <TextField
                        fullWidth
                        label={formatMessage(
                            'Governance.Rulesets.External.provider',
                            'Provider',
                        )}
                        value={values.provider}
                        onChange={(e) => update('provider', e.target.value)}
                        size='small'
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>
                            {formatMessage(
                                'Governance.Rulesets.External.resolved',
                                'Resolved',
                            )}
                        </Typography>
                        <Switch
                            checked={values.resolved}
                            onChange={(e) => update('resolved', e.target.checked)}
                            color='primary'
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

ExternalRulesetForm.propTypes = {
    rulesetContent: PropTypes.string,
    onContentChange: PropTypes.func.isRequired,
    serviceRef: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onServiceRefChange: PropTypes.func,
};

ExternalRulesetForm.defaultProps = {
    rulesetContent: '',
    serviceRef: undefined,
    onServiceRefChange: undefined,
};

export default ExternalRulesetForm;
