/*
 * ExternalServiceDialog - create/edit dialog for external services
 */
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const getEmptyService = () => ({
    id: undefined,
    name: '',
    url: '',
    prompt: '',
    timeoutMs: 50000,
    retryCount: 0,
    isLLM: false,
    headers: [],
});

function createHeaderId() {
    return `header-${Math.random().toString(36).slice(2, 10)}`;
}

function mapServiceToForm(service) {
    if (!service) {
        return getEmptyService();
    }

    return {
        id: service.id,
        name: service.name || '',
        url: service.url || '',
        prompt: service.prompt || '',
        timeoutMs: service.timeoutMs || 50000,
        retryCount: service.retryCount || 0,
        isLLM: !!service.isLLM,
        headers: service.headers
            ? service.headers.map((header) => ({
                id: header.id || createHeaderId(),
                headerKey: header.headerKey || '',
                headerValue: header.headerValue || '',
                category: header.category || 'Standard',
            }))
            : [],
    };
}

function ExternalServiceDialog({
    open,
    mode,
    service,
    saving,
    onClose,
    onSave,
}) {
    const intl = useIntl();
    const [formState, setFormState] = useState(getEmptyService());

    useEffect(() => {
        if (open) {
            setFormState(mapServiceToForm(service));
        }
    }, [open, service]);

    const updateField = (field, value) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const updateHeader = (index, field, value) => {
        setFormState((prev) => ({
            ...prev,
            headers: prev.headers.map((header, headerIndex) => (
                headerIndex === index ? { ...header, [field]: value } : header
            )),
        }));
    };

    const addHeader = () => {
        setFormState((prev) => ({
            ...prev,
            headers: [
                ...prev.headers,
                {
                    id: createHeaderId(),
                    headerKey: '',
                    headerValue: '',
                    category: 'Standard',
                },
            ],
        }));
    };

    const removeHeader = (index) => {
        setFormState((prev) => ({
            ...prev,
            headers: prev.headers.filter((_, headerIndex) => headerIndex !== index),
        }));
    };

    const handleSave = () => {
        onSave({
            ...formState,
            headers: formState.headers.map((header) => ({
                headerKey: header.headerKey,
                headerValue: header.headerValue,
                category: header.category,
            })),
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>
                {mode === 'create' ? (
                    <FormattedMessage
                        id='Governance.Rulesets.AddEdit.external.services.modal.title.create'
                        defaultMessage='Create External Service'
                    />
                ) : (
                    <FormattedMessage
                        id='Governance.Rulesets.AddEdit.external.services.modal.title.edit'
                        defaultMessage='Edit External Service'
                    />
                )}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 0 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label={intl.formatMessage({
                                id: 'Governance.Rulesets.AddEdit.external.services.form.name',
                                defaultMessage: 'Name',
                            })}
                            value={formState.name}
                            onChange={(e) => updateField('name', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label={intl.formatMessage({
                                id: 'Governance.Rulesets.AddEdit.external.services.form.url',
                                defaultMessage: 'URL',
                            })}
                            value={formState.url}
                            onChange={(e) => updateField('url', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type='number'
                            label={intl.formatMessage({
                                id: 'Governance.Rulesets.AddEdit.external.services.form.timeout',
                                defaultMessage: 'Timeout (ms)',
                            })}
                            value={formState.timeoutMs}
                            onChange={(e) => updateField('timeoutMs', Number(e.target.value))}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type='number'
                            label={intl.formatMessage({
                                id: 'Governance.Rulesets.AddEdit.external.services.form.retryCount',
                                defaultMessage: 'Retry Count',
                            })}
                            value={formState.retryCount}
                            onChange={(e) => updateField('retryCount', Number(e.target.value))}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={formState.isLLM}
                                    onChange={(e) => updateField('isLLM', e.target.checked)}
                                />
                            )}
                            label={intl.formatMessage({
                                id: 'Governance.Rulesets.AddEdit.external.services.form.isllm',
                                defaultMessage: 'Is LLM',
                            })}
                        />
                    </Grid>
                    {formState.isLLM && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={2}
                                label={intl.formatMessage({
                                    id: 'Governance.Rulesets.AddEdit.external.services.form.prompt',
                                    defaultMessage: 'Prompt',
                                })}
                                value={formState.prompt}
                                onChange={(e) => updateField('prompt', e.target.value)}
                            />
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 1,
                            }}
                        >
                            <Typography variant='subtitle2'>
                                <FormattedMessage
                                    id='Governance.Rulesets.AddEdit.external.services.headers.title'
                                    defaultMessage='Headers'
                                />
                            </Typography>
                            <Button
                                startIcon={<AddIcon />}
                                size='small'
                                onClick={addHeader}
                            >
                                <FormattedMessage
                                    id='Governance.Rulesets.AddEdit.external.services.headers.add'
                                    defaultMessage='Add Header'
                                />
                            </Button>
                        </Box>
                        {formState.headers.map((header, index) => (
                            <Grid
                                container
                                spacing={1}
                                key={header.id}
                                alignItems='center'
                                sx={{ mt: 1 }}
                            >
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        label={intl.formatMessage({
                                            id: 'Governance.Rulesets.AddEdit.external.services.headers.key',
                                            defaultMessage: 'Header Key',
                                        })}
                                        value={header.headerKey}
                                        onChange={(e) => updateHeader(index, 'headerKey', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <TextField
                                        fullWidth
                                        label={intl.formatMessage({
                                            id: 'Governance.Rulesets.AddEdit.external.services.headers.value',
                                            defaultMessage: 'Header Value',
                                        })}
                                        value={header.headerValue}
                                        onChange={(e) => updateHeader(index, 'headerValue', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        select
                                        fullWidth
                                        label={intl.formatMessage({
                                            id: 'Governance.Rulesets.AddEdit.external.services.headers.category',
                                            defaultMessage: 'Category',
                                        })}
                                        value={header.category || 'Standard'}
                                        onChange={(e) => updateHeader(index, 'category', e.target.value)}
                                    >
                                        <MenuItem value='Standard'>Standard</MenuItem>
                                        <MenuItem value='Security'>Security</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={1}>
                                    <IconButton
                                        size='small'
                                        onClick={() => removeHeader(index)}
                                        aria-label='remove header'
                                    >
                                        <DeleteOutlineIcon fontSize='small' />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    <FormattedMessage
                        id='Governance.Rulesets.AddEdit.external.services.modal.cancel'
                        defaultMessage='Cancel'
                    />
                </Button>
                <Button onClick={handleSave} variant='contained' disabled={saving}>
                    <FormattedMessage
                        id='Governance.Rulesets.AddEdit.external.services.modal.save'
                        defaultMessage='Save'
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ExternalServiceDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    mode: PropTypes.oneOf(['create', 'edit']).isRequired,
    service: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        url: PropTypes.string,
        prompt: PropTypes.string,
        timeoutMs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        retryCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        isLLM: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
        headers: PropTypes.arrayOf(PropTypes.shape({
            headerKey: PropTypes.string,
            headerValue: PropTypes.string,
            category: PropTypes.string,
        })),
    }),
    saving: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

ExternalServiceDialog.defaultProps = {
    service: null,
    saving: false,
};

export default ExternalServiceDialog;
