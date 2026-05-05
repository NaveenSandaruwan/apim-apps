/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Alert from 'AppComponents/Shared/Alert';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import AuthManager from 'AppData/AuthManager';
import {
    Box,
    Button,
    Grid,
    IconButton,
    Link,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    MenuItem,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
// EditIcon removed; not needed for list-only view
import Configurations from 'Config';
// ExternalServiceDialog removed; form is rendered inline now
import {
    Route,
    Switch,
    useHistory,
    useParams,
    Link as RouterLink,
} from 'react-router-dom';

const normalizeCategory = (category) => {
    if (!category) return 'Standard';
    const upper = String(category).toUpperCase();
    if (upper === 'STANDARD') return 'Standard';
    if (upper === 'SECURITY') return 'Security';
    return category;
};

const mapService = (service) => ({
    ...service,
    timeoutMs: service.timeoutMs || 50000,
    retryCount: service.retryCount || 0,
    isLLM: !!service.isLLM,
    headers: service.headers
        ? service.headers.map((header) => ({
            ...header,
            category: normalizeCategory(header.category),
        }))
        : [],
});

function ExternalServices() {
    const intl = useIntl();
    const [services, setServices] = useState([]);
    const [saving, setSaving] = useState(false);

    const loadServices = () => {
        const user = AuthManager.getUser();
        const authHeader = user ? `Bearer ${user.getPartialToken()}` : null;
        if (!authHeader) {
            Alert.error(intl.formatMessage({
                id: 'Governance.ExternalServices.auth.required',
                defaultMessage: 'Authentication required to load external services',
            }));
            return;
        }

        fetch('/api/am/governance/v1/external-services', {
            headers: { Authorization: authHeader },
        })
            .then((res) => res.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : (data.list || []);
                setServices(list.map(mapService));
            })
            .catch((error) => {
                console.error('Failed to load external services', error);
                Alert.error(intl.formatMessage({
                    id: 'Governance.ExternalServices.load.error',
                    defaultMessage: 'Failed to load external services',
                }));
            })
            .finally(() => {});
    };

    useEffect(() => {
        loadServices();
    }, []);

    // delete handled from form page; list view shows names only

    const saveService = (serviceData) => {
        const serviceId = serviceData.id;
        const payload = {
            name: serviceData.name,
            url: serviceData.url,
            prompt: serviceData.prompt,
            timeoutMs: serviceData.timeoutMs,
            retryCount: serviceData.retryCount,
            isLLM: serviceData.isLLM ? 'true' : 'false',
            headers: serviceData.headers.map((header) => ({
                headerKey: header.headerKey,
                headerValue: header.headerValue,
                category: normalizeCategory(header.category),
            })),
        };
        const method = serviceId ? 'PUT' : 'POST';
        const url = serviceId
            ? `/api/am/governance/v1/external-services/${serviceId}`
            : '/api/am/governance/v1/external-services';

        const user = AuthManager.getUser();
        const authHeader = user ? `Bearer ${user.getPartialToken()}` : null;
        if (!authHeader) {
            Alert.error(intl.formatMessage({
                id: 'Governance.ExternalServices.save.auth.required',
                defaultMessage: 'Authentication required to save external service',
            }));
            return;
        }

        if (method === 'PUT' && !serviceId) {
            Alert.error(intl.formatMessage({
                id: 'Governance.ExternalServices.save.missing.id',
                defaultMessage: 'Unable to update external service',
            }));
            return;
        }

        setSaving(true);
        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
            },
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to save service');
                }
                return res.json().catch(() => ({}));
            })
            .then(() => {
                loadServices();
            })
            .catch((error) => {
                console.error('Failed to save external service', error);
                Alert.error(intl.formatMessage({
                    id: 'Governance.ExternalServices.save.error',
                    defaultMessage: 'Failed to save external service',
                }));
            })
            .finally(() => setSaving(false));
    };

    // List view component: use ListBase to match Ruleset Catalog styles
    const ServicesListView = () => {
        const apiCall = () => {
            const user = AuthManager.getUser();
            const authHeader = user ? `Bearer ${user.getPartialToken()}` : null;
            if (!authHeader) {
                return Promise.reject(new Error(intl.formatMessage({
                    id: 'Governance.ExternalServices.auth.required',
                    defaultMessage: 'Authentication required to load external services',
                })));
            }
            console.debug('ExternalServices apiCall - hasAuthHeader:', !!authHeader);
            return fetch('/api/am/governance/v1/external-services', {
                headers: { Authorization: authHeader },
            })
                .then((res) => {
                    if (!res.ok) {
                        console.warn('ExternalServices apiCall - response status:', res.status);
                        throw new Error('Failed to load external services');
                    }
                    return res.json();
                })
                .then((data) => (Array.isArray(data) ? data : (data.list || [])))
                .then((list) => list.map(mapService));
        };

        const columProps = [
            {
                name: 'name',
                label: intl.formatMessage({
                    id: 'Governance.ExternalServices.column.name',
                    defaultMessage: 'Service',
                }),
                options: {
                    filter: true,
                    sort: true,
                    customBodyRender: (value) => (
                        <Typography>
                            {value}
                        </Typography>
                    ),
                    setCellProps: () => ({ style: { width: '60%' } }),
                },
            },
            { name: 'url', options: { display: false } },
            { name: 'prompt', options: { display: false } },
            { name: 'id', options: { display: false } },
        ];

        const pageProps = {
            pageStyle: 'paperLess',
            title: intl.formatMessage({ id: 'Governance.ExternalServices.title', defaultMessage: 'External Services' }),
            pageDescription: intl.formatMessage({
                id: 'Governance.ExternalServices.description',
                defaultMessage: 'Create, update, and delete external services used by EXTERNAL rulesets.',
            }),
            help: (
                <HelpBase>
                    <List component='nav'>
                        <ListItemButton>
                            <ListItemIcon sx={{ minWidth: 'auto', marginRight: 1 }}>
                                <DescriptionIcon />
                            </ListItemIcon>
                            <Link
                                target='_blank'
                                href={Configurations.app.docUrl + 'governance/api-governance-admin-capabilities/'}
                                underline='hover'
                            >
                                <ListItemText
                                    primary={(
                                        <FormattedMessage
                                            id='Governance.ExternalServices.help.link'
                                            defaultMessage='Manage external services'
                                        />
                                    )}
                                />
                            </Link>
                        </ListItemButton>
                    </List>
                </HelpBase>
            ),
        };

        const emptyBoxProps = {
            title: (
                <Typography gutterBottom variant='h5' component='h2'>
                    <FormattedMessage
                        id='Governance.ExternalServices.empty.title'
                        defaultMessage='External Services'
                    />
                </Typography>
            ),
            content: (
                <Typography variant='body2' color='textSecondary' component='p'>
                    <FormattedMessage
                        id='Governance.ExternalServices.empty.content'
                        defaultMessage='No external services defined. Click Create Service to add one.'
                    />
                </Typography>
            ),
        };

        const addButtonOverride = (
            <RouterLink to='/governance/external-services/create'>
                <Button variant='contained' color='primary' size='small' role='button'>
                    <FormattedMessage id='Governance.ExternalServices.create' defaultMessage='Create Service' />
                </Button>
            </RouterLink>
        );

        return (
            <ListBase
                columProps={columProps}
                pageProps={pageProps}
                apiCall={apiCall}
                emptyBoxProps={emptyBoxProps}
                addButtonOverride={addButtonOverride}
                editComponentProps={{
                    icon: <EditIcon />,
                    title: intl.formatMessage({
                        id: 'Governance.ExternalServices.edit.title',
                        defaultMessage: 'Edit Service',
                    }),
                    routeTo: '/governance/external-services/',
                }}
            />
        );
    };

    // Full page form for create/edit (reuses dialog form fields but rendered as page)
    const ExternalServiceForm = () => {
        const { id } = useParams();
        const history = useHistory();
        const isCreate = !id;
        const [formService, setFormService] = useState(null);

        useEffect(() => {
            if (id) {
                const found = services.find((s) => String(s.id) === String(id));
                if (found) setFormService(found);
                else {
                    // fetch single service
                    const user = AuthManager.getUser();
                    const authHeader = user ? `Bearer ${user.getPartialToken()}` : null;
                    fetch(`/api/am/governance/v1/external-services/${id}`, {
                        headers: { Authorization: authHeader },
                    })
                        .then((res) => res.json())
                        .then((data) => setFormService(mapService(data)))
                        .catch((e) => console.error(e));
                }
            } else {
                setFormService(null);
            }
        }, [id, services]);

        const handleClose = () => {
            history.push('/governance/external-services');
        };

        // Inline full-page form (no modal)
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

        const createHeaderId = () => `header-${Math.random().toString(36).slice(2, 10)}`;

        const mapServiceToForm = (service) => {
            if (!service) return getEmptyService();
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
                        category: normalizeCategory(header.category),
                    }))
                    : [],
            };
        };

        const [formState, setFormState] = useState(getEmptyService());

        useEffect(() => {
            setFormState(mapServiceToForm(formService));
        }, [formService]);

        const updateField = (field, value) => {
            setFormState((prev) => ({ ...prev, [field]: value }));
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

        const handleSaveLocal = () => {
            saveService({
                ...formState,
                headers: formState.headers.map((h) => ({
                    headerKey: h.headerKey,
                    headerValue: h.headerValue,
                    category: h.category,
                })),
            });
            handleClose();
        };

        return (
            <ContentBase
                pageStyle='half'
                title={isCreate ? (
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
            >
                <Box sx={{ m: 2 }}>
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
                                <Button startIcon={<AddIcon />} size='small' onClick={addHeader}>
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

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button onClick={handleClose}>
                                    <FormattedMessage
                                        id='Governance.Rulesets.AddEdit.external.services.modal.cancel'
                                        defaultMessage='Cancel'
                                    />
                                </Button>
                                <Button onClick={handleSaveLocal} variant='contained' disabled={saving}>
                                    <FormattedMessage
                                        id='Governance.Rulesets.AddEdit.external.services.modal.save'
                                        defaultMessage='Save'
                                    />
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </ContentBase>
        );
    };

    // Router for services list and form pages
    return (
        <Switch>
            <Route exact path='/governance/external-services' component={ServicesListView} />
            <Route exact path='/governance/external-services/create' component={ExternalServiceForm} />
            <Route exact path='/governance/external-services/:id' component={ExternalServiceForm} />
        </Switch>
    );
}

export default ExternalServices;
